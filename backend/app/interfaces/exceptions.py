class ServiceException(Exception):
    pass


class InvalidEmailOrPasswordError(ServiceException):
    pass


class UserAlreadyExistsError(ServiceException):
    pass


class InvalidTokenError(ServiceException):
    pass


class NotAuthorizedError(ServiceException):
    pass


class ApplicationAlreadyExists(ServiceException):
    pass


class NoRequestFoundError(ServiceException):
    pass


class NoApplicationFoundError(ServiceException):
    pass


class RequestNotOpen(ServiceException):
    pass


class CanNotDeleteApplicationError(ServiceException):
    pass


class ApplicationCannotBeRated(ServiceException):
    pass


class CanNotAcceptApplication(ServiceException):
    pass


class UserNotFoundError(ServiceException):
    pass


class AIServiceUnavailableError(ServiceException):
    pass
