import Boton from '@/components/boton';
import Typo from '@/components/typo';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { useAuth, useLogout } from '@/context/AuthContext';
import { gastosService } from '@/utils/gastosService';
import { verticalScale } from '@/utils/styling';
import { TrashIcon, UserCircleIcon } from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

const Ajustes = () => {
  const { user } = useAuth();
  const logout = useLogout();
  const [totalGastos, setTotalGastos] = useState(0);
  const [mesesCerrados, setMesesCerrados] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;
    gastosService.getAll(user.uid).then((g) => setTotalGastos(g.length));
    gastosService.getMesesCerrados(user.uid).then((m) => setMesesCerrados(m.length));
  }, [user]);

  const handleEliminarDatos = () => {
    Alert.alert(
      'Eliminar todos los datos',
      'Esta accion borrara todos tus gastos e historial. No se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            // Vaciar storage del usuario actual
            const { storage } = await import('@/utils/storage');
            await storage.remove(`gastos_${user!.uid}`);
            await storage.remove(`meses_${user!.uid}`);
            await storage.remove(`categorias_custom_${user!.uid}`);
            setTotalGastos(0);
            setMesesCerrados(0);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Typo size={24} fontWeight="800">Ajustes</Typo>
      </View>

      {/* Perfil */}
      <View style={styles.card}>
        <UserCircleIcon size={44} color={colors.primary} />
        <View style={{ gap: 2 }}>
          <Typo size={18} fontWeight="700">{user?.name}</Typo>
          <Typo size={14} color={colors.neutral400}>{user?.email}</Typo>
        </View>
      </View>

      {/* Estadisticas */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Typo size={28} fontWeight="800" color={colors.primary}>{totalGastos}</Typo>
          <Typo size={13} color={colors.neutral400}>Gastos registrados</Typo>
        </View>
        <View style={styles.statCard}>
          <Typo size={28} fontWeight="800" color={colors.primary}>{mesesCerrados}</Typo>
          <Typo size={13} color={colors.neutral400}>Meses cerrados</Typo>
        </View>
      </View>

      {/* Acciones */}
      <View style={styles.section}>
        <TouchableOpacity onPress={handleEliminarDatos} style={styles.accionItem}>
          <TrashIcon size={20} color={colors.rose} />
          <Typo size={15} color={colors.rose}>Eliminar todos mis datos</Typo>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 'auto', paddingHorizontal: spacingX._20, paddingBottom: verticalScale(20) }}>
        <Boton onPress={logout} style={styles.logoutBtn}>
          <Typo size={17} color={colors.text} fontWeight="600">Cerrar sesion</Typo>
        </Boton>
      </View>
    </View>
  );
};

export default Ajustes;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral900,
    paddingTop: verticalScale(55),
    gap: spacingY._20,
  },
  header: {
    paddingHorizontal: spacingX._20,
  },
  card: {
    marginHorizontal: spacingX._20,
    backgroundColor: colors.neutral800,
    borderRadius: radius._20,
    borderCurve: 'continuous',
    padding: spacingX._20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: spacingX._20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.neutral800,
    borderRadius: radius._15,
    borderCurve: 'continuous',
    padding: spacingX._15,
    alignItems: 'center',
    gap: 4,
  },
  section: {
    marginHorizontal: spacingX._20,
    backgroundColor: colors.neutral800,
    borderRadius: radius._15,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  accionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacingX._20,
  },
  logoutBtn: {
    backgroundColor: colors.neutral700,
  },
});
