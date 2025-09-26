import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface CustomDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleOptionClick = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div
        onClick={handleToggle}
        className={`
          w-full px-3 py-2 border rounded-lg cursor-pointer flex items-center justify-between
          transition-colors duration-200 bg-white
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'}
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-200' : ''}
        `}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  className={`
                    px-3 py-2 cursor-pointer transition-colors duration-150
                    hover:bg-blue-50 hover:text-blue-700
                    ${value === option ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-900'}
                  `}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 text-center">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
