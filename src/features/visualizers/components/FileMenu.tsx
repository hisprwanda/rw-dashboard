import i18n from '@dhis2/d2-i18n'
import { DropdownButton, FlyoutMenu, IconDownload16, IconSave16, MenuItem } from '@dhis2/ui'
import { useState } from 'react'

interface FileMenuProps {
    isSaved: boolean
    onSave: () => void
    onExport: () => void
}

/** Builder "File" menu: save (or update) and export. */
export const FileMenu = ({ isSaved, onSave, onExport }: FileMenuProps) => {
    const [open, setOpen] = useState(false)
    const run = (action: () => void) => () => {
        setOpen(false)
        action()
    }
    return (
        <DropdownButton
            small
            open={open}
            onClick={() => setOpen((value) => !value)}
            component={
                <FlyoutMenu dense>
                    <MenuItem
                        icon={<IconSave16 />}
                        label={isSaved ? i18n.t('Update') : i18n.t('Save')}
                        onClick={run(onSave)}
                    />
                    <MenuItem
                        icon={<IconDownload16 />}
                        label={i18n.t('Export')}
                        onClick={run(onExport)}
                    />
                </FlyoutMenu>
            }
        >
            {i18n.t('File')}
        </DropdownButton>
    )
}
