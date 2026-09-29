import type { ReactNode } from 'react'

/** A bulletin chapter: blue banner title, then its content. */
export const BulletinSection = ({
    title,
    children,
}: {
    title?: ReactNode
    children: ReactNode
}) => (
    <section className="mb-5 rounded p-4">
        {title && (
            <h2 className="mb-5 mt-0 bg-blue-400 py-4 text-center text-xl font-bold">{title}</h2>
        )}
        {children}
    </section>
)

/** A bulleted list, or a fallback line when empty. */
export const MessageList = ({ items, empty }: { items: readonly string[]; empty: string }) =>
    items.length ? (
        <ul className="list-disc pl-6">
            {items.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
    ) : (
        <p>{empty}</p>
    )
