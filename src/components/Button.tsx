interface ButtonProps {
	children: React.ReactNode
	loading?: boolean
	disabled?: boolean
	type?: 'button' | 'submit' | 'reset'
	onClick?: () => void
}

export const Button = ({ children, loading, disabled, type = 'button', ...props }: ButtonProps) => (
	<button 
		type={type}
		disabled={loading || disabled} 
		{...props}
	>
		{loading ? 'Loading...' : children}
	</button>
)
