import React, { useState } from "react";
import { ToggleWrapper, ToggleButton } from "./Toggle.styles";

const Toggle = () => {
  const [isOn, setIsOn] = useState(false);

  return (
    <ToggleWrapper onClick={() => setIsOn(!isOn)}>
      <ToggleButton isOn={isOn}>{isOn ? "ON" : "OFF"}</ToggleButton>
    </ToggleWrapper>
  );
};

export default Toggle;
