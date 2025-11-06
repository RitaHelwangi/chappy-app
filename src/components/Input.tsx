interface InputProps {
	type?: 'text' | 'password' | 'email'
	name?: string
	placeholder?: string
	required?: boolean
}

export const Input = ({ type = 'text', ...props }: InputProps) => (
	<input type={type} {...props} />
)
