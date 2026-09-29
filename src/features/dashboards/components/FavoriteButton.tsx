import i18n from '@dhis2/d2-i18n'
import { Button, IconStar24, IconStarFilled24 } from '@dhis2/ui'

interface FavoriteButtonProps {
    isFavorite: boolean
    loading?: boolean
    onToggle: () => void
}

export const FavoriteButton = ({ isFavorite, loading = false, onToggle }: FavoriteButtonProps) => (
    <Button
        small
        secondary
        loading={loading}
        aria-pressed={isFavorite}
        title={isFavorite ? i18n.t('Remove from favorites') : i18n.t('Add to favorites')}
        icon={isFavorite ? <IconStarFilled24 color="#f5b400" /> : <IconStar24 />}
        onClick={(_payload, event) => {
            event.stopPropagation()
            onToggle()
        }}
    />
)
