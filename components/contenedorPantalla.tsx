import { colors } from '@/constants/theme';
import { ScreenWrapperProps } from '@/types';
import { Dimensions, Platform, StatusBar, StyleSheet, View } from 'react-native';

const { height } =  Dimensions.get('window');

const ContenedorPantalla = ({style, children}: ScreenWrapperProps) => {
    let paddingTop = Platform.OS == "ios" ? height * 0.60 : 50;
  return (
    <View 
      style={[
        {
          paddingTop,
          flex: 1,
          backgroundColor: colors.neutral900,
        },
        style,
        ]}>
          <StatusBar barStyle="light-content"/>
        {children}
    </View>
  )
}

export default ContenedorPantalla;

const styles = StyleSheet.create({})