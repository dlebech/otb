declare module "*.json" {
  const value: unknown;
  export default value;
}

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}



// React Select module declaration
declare module 'react-select' {
  import { Component } from 'react';
  
  export interface Option {
    value: string;
    label: string;
  }

  export interface SelectProps<T = Option> {
    value?: T | T[] | null;
    options: T[];
    onChange?: (value: T | T[] | null) => void;
    isMulti?: boolean;
    placeholder?: string;
    className?: string;
    isSearchable?: boolean;
    isClearable?: boolean;
    name?: string;
  }

  export default class Select<T = Option> extends Component<SelectProps<T>> {}
}
