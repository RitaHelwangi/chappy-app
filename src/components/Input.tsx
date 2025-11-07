interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	type?: 'text' | 'password' | 'email'
}

export const Input = ({ type = 'text', ...props }: InputProps) => (
	<input type={type} {...props} />
)
