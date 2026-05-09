import { useEffect, useState, useRef } from "react";
import { debounce } from "@/app/helpers/debounce";

export function useDebounce(value: string, delay = 300): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  const debouncedSetRef = useRef(
    debounce((v: unknown) => setDebouncedValue(v as string), delay)
  );

  useEffect(() => {
    debouncedSetRef.current(value);
  }, [value]);

  return debouncedValue;
}
