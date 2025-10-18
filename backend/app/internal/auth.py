import datetime
import os
from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from pydantic.dataclasses import dataclass

from ..models import User

load_dotenv()
ALGORITHM = "HS256"
SECRET_KEY = os.getenv("JWT_SECRET")

password_hash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


@dataclass()
class UserData:
    id: int
    name: str
    email: str
    is_volunteer: bool

    @classmethod
    def from_user(cls, user: User):
        return cls(user.id, user.name, user.email, user.is_volunteer)

    def create_token(self, expires_delta: timedelta | None = None):
        return create_token(
            {
                "id": self.id,
                "name": self.name,
                "email": self.email,
                "is_volunteer": self.is_volunteer,
            },
            expires_delta,
        )


def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)


def get_password_hash(password):
    return password_hash.hash(password)


def create_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=5)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_user_data_from_token(token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={
                "require": ["exp"],
            },
        )
        payload.pop("exp")
        return UserData(**payload)
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


UserDataDep = Annotated[UserData, Depends(get_user_data_from_token)]


async def verify_help_seeker(user_data: UserDataDep):
    if user_data.is_volunteer:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Only help seekers can access this resource",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_data


async def verify_volunteer(user_data: UserDataDep):
    if not user_data.is_volunteer:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Only volunteers can access this resource",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_data

VolunteerDep = Annotated[UserData, Depends(verify_volunteer)]
HelpSeekerDep = Annotated[UserData, Depends(verify_help_seeker)]
