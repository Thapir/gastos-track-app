import BotonBack from '@/components/botonBack';
import Boton from '@/components/boton';
import ContenedorPantalla from '@/components/contenedorPantalla';
import Input from '@/components/input';
import Typo from '@/components/typo';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { verticalScale } from '@/utils/styling';
import { useRouter } from 'expo-router';
import { EnvelopeSimpleIcon, LockKeyIcon, UserCircleIcon } from 'phosphor-react-native';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

const Registrar = () => {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contrasena corta', 'La contrasena debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    const result = await register(email.trim(), password, name.trim());
    setLoading(false);
    if (!result.success) Alert.alert('Error', result.msg);
  };

  return (
    <ContenedorPantalla>
      <View style={styles.container}>
        <BotonBack iconSize={28} />

        <View style={{ gap: 5, marginTop: spacingY._20 }}>
          <Typo size={30} fontWeight="800">Crea tu</Typo>
          <Typo size={30} fontWeight="800">Cuenta</Typo>
        </View>

        <View style={styles.form}>
          <Typo size={16} color={colors.textLighter}>
            Registrate para empezar a controlar tus gastos
          </Typo>

          <Input
            placeholder="Nombre completo"
            value={name}
            onChangeText={setName}
            icon={<UserCircleIcon size={20} color={colors.neutral400} />}
          />

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

          <Boton onPress={handleRegister} loading={loading}>
            <Typo size={18} color={colors.neutral900} fontWeight="700">
              Crear Cuenta
            </Typo>
          </Boton>
        </View>

        <View style={styles.footer}>
          <Typo size={15} color={colors.textLighter}>Ya tienes cuenta?</Typo>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Typo size={15} color={colors.primary} fontWeight="600">
              {' '}Iniciar Sesion
            </Typo>
          </TouchableOpacity>
        </View>
      </View>
    </ContenedorPantalla>
  );
};

export default Registrar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacingY._30,
    paddingHorizontal: spacingX._20,
  },
  form: {
    gap: spacingY._20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: verticalScale(20),
  },
});
