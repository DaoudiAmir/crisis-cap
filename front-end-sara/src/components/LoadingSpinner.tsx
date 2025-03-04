import { ClipLoader } from 'react-spinners';

type LoadingSpinnerProps = {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  fullScreen?: boolean;
};

const LoadingSpinner = ({ 
  size = 'medium', 
  color = '#3B82F6', 
  fullScreen = false 
}: LoadingSpinnerProps) => {
  
  const sizeMap = {
    small: 30,
    medium: 50,
    large: 70
  };
  
  const spinnerSize = sizeMap[size];
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-base-100 bg-opacity-75 z-50">
        <ClipLoader color={color} size={spinnerSize} />
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center p-4">
      <ClipLoader color={color} size={spinnerSize} />
    </div>
  );
};

export default LoadingSpinner;