import Boton from '@/components/boton';
import ContenedorPantalla from '@/components/contenedorPantalla';
import Typo from '@/components/typo';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { verticalScale } from '@/utils/styling';
import { useRouter } from 'expo-router';
import {
  ChartLineUpIcon,
  PiggyBankIcon,
  WalletIcon,
} from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

const Welcome = () => {
  const router = useRouter();

  return (
    <ContenedorPantalla>
      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Typo size={20} fontWeight="800" color={colors.primary}>
            Gastos
          </Typo>
          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            style={styles.loginPill}
          >
            <Typo size={13} fontWeight="600">
              Iniciar Sesion
            </Typo>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <Animated.View entering={FadeIn.duration(800)} style={styles.hero}>
          <View style={styles.iconCircle}>
            <WalletIcon size={56} color={colors.neutral900} weight="fill" />
          </View>

          <View style={styles.heroText}>
            <Typo size={34} fontWeight="800">
              Toma el control
            </Typo>
            <Typo size={34} fontWeight="800" color={colors.primary}>
              de tu dinero
            </Typo>
            <Typo
              size={15}
              color={colors.neutral400}
              style={{ marginTop: spacingY._10, textAlign: 'center' }}
            >
              Registra tus gastos, define un presupuesto{'\n'}y mira tu progreso mes a mes.
            </Typo>
          </View>
        </Animated.View>

        {/* Features */}
        <Animated.View
          entering={FadeInUp.duration(900).delay(200)}
          style={styles.features}
        >
          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: '#a3e63520' }]}>
              <ChartLineUpIcon size={22} color={colors.primary} weight="bold" />
            </View>
            <View style={{ flex: 1 }}>
              <Typo size={15} fontWeight="700">Dashboard mensual</Typo>
              <Typo size={13} color={colors.neutral400}>
                Visualiza tus gastos en tiempo real
              </Typo>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: '#3b82f620' }]}>
              <PiggyBankIcon size={22} color="#3b82f6" weight="bold" />
            </View>
            <View style={{ flex: 1 }}>
              <Typo size={15} fontWeight="700">Presupuesto inteligente</Typo>
              <Typo size={13} color={colors.neutral400}>
                Establece un limite y mantente al tanto
              </Typo>
            </View>
          </View>
        </Animated.View>

        {/* Footer CTA */}
        <Animated.View
          entering={FadeInDown.duration(900).delay(300)}
          style={styles.footer}
        >
          <Boton onPress={() => router.push('/auth/registrar')}>
            <Typo size={18} color={colors.neutral900} fontWeight="700">
              Comenzar ahora
            </Typo>
          </Boton>

          <View style={styles.loginRow}>
            <Typo size={14} color={colors.neutral400}>
              Ya tienes cuenta?
            </Typo>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Typo size={14} color={colors.primary} fontWeight="600">
                {' '}Iniciar Sesion
              </Typo>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </ContenedorPantalla>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingY._30,
  },
  loginPill: {
    backgroundColor: colors.neutral800,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius._20,
  },
  hero: {
    alignItems: 'center',
    gap: spacingY._20,
    marginTop: verticalScale(20),
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
  },
  heroText: {
    alignItems: 'center',
  },
  features: {
    gap: spacingY._12,
    marginTop: verticalScale(40),
  },
  featureCard: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._15,
    borderCurve: 'continuous',
    padding: spacingX._15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: verticalScale(25),
    gap: spacingY._15,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
