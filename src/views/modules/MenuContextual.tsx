import React, { useRef } from 'react';
import { Flex, IconButton, Menu, MenuButton, MenuItem, MenuList, Switch, useToast } from '@chakra-ui/react';
import { EllipsisVertical, ImageUp } from 'lucide-react';
import { useSwitch } from '../../services/SwitchContext';
import { api_url } from '@/utils';

const MenuContextual = () => {
    const { isSwitchOn, toggleSwitch } = useSwitch();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const toast = useToast();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await fetch(`${api_url}archivos/upload/logo`, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const result = await response.text();
                    toast({
                        title: 'Éxito',
                        description: result,
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                    });
                } else {
                    toast({
                        title: 'Error',
                        description: 'No se pudo subir la imagen.',
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                    });
                }
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Ocurrió un error al subir la imagen.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    const handleMenuItemClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Flex ml={'auto'}>
            <Menu closeOnSelect={false}>
                <MenuButton
                    as={IconButton}
                    aria-label='Options'
                    icon={<EllipsisVertical />}
                    variant='ghost'
                    color={'white'}
                />
                <MenuList>
                    <MenuItem
                        icon={<ImageUp />}
                        color={'black'}
                        onClick={handleMenuItemClick}
                    >
                        Agregar logo
                    </MenuItem>
                    <MenuItem color={'black'}>
                        Impresion formato estilistico
                        <Switch ml={2} isChecked={isSwitchOn} onChange={toggleSwitch} />
                    </MenuItem>
                </MenuList>
            </Menu>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
        </Flex>
    );
};

export default MenuContextual;