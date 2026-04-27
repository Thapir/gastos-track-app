import BotonBack from '@/components/botonBack';
import ContenedorPantalla from '@/components/contenedorPantalla';
import Input from '@/components/input';
import Boton from '@/components/boton';
import Typo from '@/components/typo';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { storage } from '@/utils/storage';
import { verticalScale } from '@/utils/styling';
import { useRouter } from 'expo-router';
import { EnvelopeSimpleIcon, LockKeyIcon } from 'phosphor-react-native';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

const Login = () => {
  const router = useRouter();
  const { login, setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuest = async () => {
    const guest = { uid: 'guest', name: 'Invitado', email: null };
    await storage.set('currentUser', guest);
    setUser(guest);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos.');
      return;
    }
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (!result.success) Alert.alert('Error', result.msg);
  };

  return (
    <ContenedorPantalla>
      <View style={styles.container}>
        <BotonBack iconSize={28} />

        <View style={{ gap: 5, marginTop: spacingY._20 }}>
          <Typo size={30} fontWeight="800">Hola,</Typo>
          <Typo size={30} fontWeight="800">Bienvenido de Vuelta</Typo>
        </View>

        <View style={styles.form}>
          <Typo size={16} color={colors.textLighter}>
            Inicia sesion para seguir tus gastos
          </Typo>

          <Input
            placeholder="Correo electronico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<EnvelopeSimpleIcon size={20} color={colors.neutral400} />}
          />

          <Input
            placeholder="Contrasena"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon={<LockKeyIcon size={20} color={colors.neutral400} />}
          />

          <Boton onPress={handleLogin} loading={loading}>
            <Typo size={18} color={colors.neutral900} fontWeight="700">
              Iniciar Sesion
            </Typo>
          </Boton>
        </View>

        <TouchableOpacity onPress={handleGuest} style={styles.guestBtn}>
          <Typo size={15} color={colors.neutral500}>Continuar sin cuenta</Typo>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Typo size={15} color={colors.textLighter}>No tienes cuenta?</Typo>
          <TouchableOpacity onPress={() => router.push('/auth/registrar')}>
            <Typo size={15} color={colors.primary} fontWeight="600">
              {' '}Registrate
            </Typo>
          </TouchableOpacity>
        </View>
      </View>
    </ContenedorPantalla>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacingY._30,
    paddingHorizontal: spacingX._20,
  },
  form: {
    gap: spacingY._20,
  },
  guestBtn: {
    alignItems: 'center',
    paddingVertical: verticalScale(8),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: verticalScale(20),
  },
});
