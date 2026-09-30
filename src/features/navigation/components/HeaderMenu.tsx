import { Popover } from '@dhis2/ui'
import { useRef, useState, type ReactNode } from 'react'

interface HeaderMenuProps {
    /** Accessible name of the button that opens the menu. */
    label: string
    trigger: ReactNode
    children: (close: () => void) => ReactNode
}

/** A header icon button opening a popover (closed on outside click). */
export const HeaderMenu = ({ label, trigger, children }: HeaderMenuProps) => {
    const ref = useRef<HTMLButtonElement>(null)
    const [open, setOpen] = useState(false)
    const close = () => setOpen(false)
    return (
        <>
            <button
                ref={ref}
                type="button"
                aria-label={label}
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
                className="flex h-12 items-center border-0 bg-transparent px-3 text-white hover:bg-[#1A557F]"
            >
                {trigger}
            </button>
            {open && (
                <Popover
                    reference={ref}
                    placement="bottom-end"
                    arrow={false}
                    onClickOutside={close}
                >
                    {children(close)}
                </Popover>
            )}
        </>
    )
}
