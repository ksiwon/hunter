import React from 'react';
import { Wrapper, Button } from './BotButton.styles';

interface BotButtonProps {
  onPreviousClick: () => void;
  onSubmitClick: () => void;
  previousLabel: string;
  submitLabel: string;
}

const BotButton: React.FC<BotButtonProps> = ({
  onPreviousClick,
  onSubmitClick,
  previousLabel,
  submitLabel,
}) => {
  return (
    <Wrapper>
      <Button variant="gray" onClick={onPreviousClick}>
        {previousLabel}
      </Button>
      <Button variant="primary" onClick={onSubmitClick}>
        {submitLabel}
      </Button>
    </Wrapper>
  );
};

export default BotButton;
