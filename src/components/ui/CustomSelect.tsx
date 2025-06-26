import { useState, useRef, useEffect } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
  description?: string;
  filesize?: number;
}

interface CustomSelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "请选择...",
  className = "",
  disabled = false
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>(
    value !== undefined ? options.find(opt => opt.value === value) || null : null
  );

  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectOption = (option: SelectOption) => {
    setSelectedOption(option);
    onChange(option.value);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* 选择器按钮 */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`
          w-full px-4 py-3 text-left border-2 rounded-xl transition-all duration-200
          flex items-center justify-between text-lg font-medium
          ${disabled 
            ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-50' 
            : isOpen
              ? 'border-blue-500 dark:border-blue-400 bg-white dark:bg-gray-700 shadow-lg'
              : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 shadow-sm hover:shadow-md'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}
        `}
      >
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {selectedOption ? (
            <>
              <span className="text-2xl">📺</span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate">{selectedOption.label}</div>
                {selectedOption.filesize && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {(selectedOption.filesize / 1024 / 1024).toFixed(1)} MB
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <span className="text-2xl">🎯</span>
              <span>{placeholder}</span>
            </>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl overflow-hidden animate-slideDownAndFade">
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelectOption(option)}
                className={`
                  w-full px-4 py-4 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 
                  transition-all duration-150 border-b border-gray-100 dark:border-gray-700 last:border-b-0
                  ${selectedOption?.value === option.value 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100' 
                    : 'text-gray-900 dark:text-white'
                  }
                  focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20
                `}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">📺</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base mb-1 truncate">
                      {option.label}
                    </div>
                    {option.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {option.description}
                      </div>
                    )}
                    {option.filesize && (
                      <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        💾 {(option.filesize / 1024 / 1024).toFixed(1)} MB
                      </div>
                    )}
                  </div>
                  {selectedOption?.value === option.value && (
                    <div className="text-blue-500 dark:text-blue-400">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 