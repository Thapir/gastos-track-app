import { colors, radius } from '@/constants/theme';
import { InputProps } from '@/types';
import { verticalScale } from '@/utils/styling';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

const Input = ({ icon, containerStyle, inputStyle, inputRef, ...props }: InputProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <TextInput
        ref={inputRef}
        style={[styles.input, inputStyle]}
        placeholderTextColor={colors.neutral400}
        {...props}
      />
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral800,
    borderRadius: radius._12,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    height: verticalScale(52),
    gap: 10,
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: verticalScale(15),
  },
});
