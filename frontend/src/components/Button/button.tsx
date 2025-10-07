import './button.css';
import { Link } from 'react-router-dom';

interface ButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  buttonStyle?: string;
  buttonSize?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, type, onClick, buttonStyle, buttonSize }) => {
  const STYLES = ['btn--primary', 'btn--outline', 'btn--test'];
  const SIZES = ['btn--medium', 'btn--large'];

  const checkButtonStyle = STYLES.includes(buttonStyle ?? '') ? buttonStyle! : STYLES[0];
  const checkButtonSize = SIZES.includes(buttonSize ?? '') ? buttonSize! : SIZES[0];

  return (
    <Link to="/sign-up" className='btn-mobile'>
      <button
        className={`btn ${checkButtonStyle} ${checkButtonSize}`}
        onClick={onClick}
        type={type}
      >
        {children}
      </button>
    </Link>
  );
}