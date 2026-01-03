/**
 * Input component - Replaced with Tailwind CSS
 */
const Input = ({
    label,
    type = 'text',
    error,
    placeholder,
    fullWidth = true,
    id,
    className = '',
    ...props
}) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''} ${className}`}>
            {label && (
                <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                type={type}
                className={`
          px-4 py-2 border rounded-lg text-base transition-all
          placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-offset-1
          disabled:opacity-60 disabled:bg-slate-50
          ${error
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100 hover:border-slate-300'
                    }
        `}
                placeholder={placeholder}
                {...props}
            />
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
};

export default Input;
