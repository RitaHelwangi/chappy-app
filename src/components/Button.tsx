interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode
	loading?: boolean
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
