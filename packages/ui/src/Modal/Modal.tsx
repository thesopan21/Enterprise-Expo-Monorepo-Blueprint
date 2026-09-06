import { theme } from '@workspace/theme';
// Icon kept generic so this package doesn't hardcode a specific close-icon
// choice; pass phosphor-react-native's `X` (or any Icon) via `closeIcon`.
import type { Icon } from 'phosphor-react-native';
import type { ReactNode } from 'react';
import { Modal as RNModal, Pressable, StyleSheet, View, type ModalProps as RNModalProps } from 'react-native';

import { IconButton } from '../IconButton/IconButton';
import { Typography } from '../Typography/Typography';

export type ModalProps = Pick<RNModalProps, 'animationType' | 'testID'> & {
  visible: boolean;
  onClose: () => void;
  title?: string;
  closeIcon?: Icon;
  children: ReactNode;
};

const colors = theme.colors.light;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.background,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export function Modal({
  visible,
  onClose,
  title,
  closeIcon,
  children,
  animationType = 'slide',
  testID,
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
      testID={testID}
    >
      <Pressable
        accessibilityLabel="Close"
        style={styles.backdrop}
        onPress={onClose}
      >
        <Pressable
          accessibilityViewIsModal
          style={styles.content}
          onPress={(event) => event.stopPropagation()}
        >
          {title || closeIcon ? (
            <View style={styles.header}>
              {title ? <Typography variant="h3">{title}</Typography> : <View />}
              {closeIcon ? (
                <IconButton icon={closeIcon} accessibilityLabel="Close" size="sm" onPress={onClose} />
              ) : null}
            </View>
          ) : null}
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
