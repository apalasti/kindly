import React, { type ElementType } from "react";
import { Icon } from "@chakra-ui/react";
import { FaHandHoldingHeart, FaHandsHelping } from "react-icons/fa";
import "./actor-type-switch.css";

interface ActorTypeSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const ActorTypeSwitch: React.FC<ActorTypeSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <label className="actor-switch">
      <input
        className="actor-switch__input"
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        aria-label={checked ? "Volunteer" : "Help Seeker"}
      />
      <div className="actor-switch__icon actor-switch__icon--help-seeker">
        <Icon as={FaHandHoldingHeart as ElementType} />
      </div>
      <div className="actor-switch__icon actor-switch__icon--volunteer">
        <Icon as={FaHandsHelping as unknown as ElementType} />
      </div>
      <span className="actor-switch__sr">
        {checked ? "Volunteer" : "Help Seeker"}
      </span>
    </label>
  );
};
