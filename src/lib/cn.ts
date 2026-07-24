import { clsx, type ClassValue } from 'clsx'

/** Une clases condicionales. Envoltura fina para poder cambiar de libreria despues. */
export const cn = (...parts: ClassValue[]) => clsx(parts)
