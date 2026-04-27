import Boton from '@/components/boton';
import Typo from '@/components/typo';
import { CATEGORIAS_FIJAS } from '@/constants/categorias';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { useAuth, useLogout } from '@/context/AuthContext';
import { Gasto, MesCerrado, gastosService } from '@/utils/gastosService';
import { verticalScale } from '@/utils/styling';
import { useRouter } from 'expo-router';
import { PencilSimpleIcon, PlusIcon } from 'phosphor-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

const Dashboard = () => {
  const { user } = useAuth();
  const logout = useLogout();
  const router = useRouter();
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [cerrando, setCerrando] = useState(false);

  // Presupuesto
  const [presupuesto, setPresupuesto] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputPresupuesto, setInputPresupuesto] = useState('');

  const now = new Date();
  const mesActual = now.getMonth();
  const añoActual = now.getFullYear();
  const esFinalDeMes = now.getDate() >= 25;

  const total = gastos.reduce((acc, g) => acc + g.monto, 0);
  const restante = presupuesto !== null ? presupuesto - total : null;
  const porcentaje = presupuesto && presupuesto > 0 ? Math.min(total / presupuesto, 1) : 0;
  const sobrePresupuesto = restante !== null && restante < 0;

  const barColor = porcentaje >= 1
    ? colors.rose
    : porcentaje >= 0.8
    ? '#f97316'
    : colors.primary;

  const cargar = useCallback(async () => {
    if (!user?.uid) return;
    const [data, pres] = await Promise.all([
      gastosService.getMesActual(user.uid),
      gastosService.getPresupuesto(user.uid, mesActual, añoActual),
    ]);
    setGastos(data);
    setPresupuesto(pres);
  }, [user]);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    const verificarCierreAutomatico = async () => {
      if (!user?.uid) return;
      const meses = await gastosService.getMesesCerrados(user.uid);
      const mesPrevio = mesActual === 0 ? 11 : mesActual - 1;
      const añoPrevio = mesActual === 0 ? añoActual - 1 : añoActual;
      const yaExiste = meses.find((m: MesCerrado) => m.mes === mesPrevio && m.año === añoPrevio);
      if (!yaExiste && now.getDate() <= 3) {
        await gastosService.cerrarMes(user.uid, mesPrevio, añoPrevio);
      }
    };
    verificarCierreAutomatico();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await cargar();
    setRefreshing(false);
  };

  const handleGuardarPresupuesto = async () => {
    const valor = Number(inputPresupuesto);
    if (!inputPresupuesto || isNaN(valor) || valor <= 0) {
      Alert.alert('Monto invalido', 'Ingresa un monto mayor a 0.');
      return;
    }
    await gastosService.setPresupuesto(user!.uid!, mesActual, añoActual, valor);
    setPresupuesto(valor);
    setInputPresupuesto('');
    setModalVisible(false);
  };

  const handleCerrarMes = () => {
    Alert.alert(
      'Cerrar mes',
      `¿Confirmas cerrar ${MESES[mesActual]} ${añoActual}? Se guardara en el historial.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar mes',
          style: 'destructive',
          onPress: async () => {
            setCerrando(true);
            await gastosService.cerrarMes(user!.uid!, mesActual, añoActual);
            await cargar();
            setCerrando(false);
          },
        },
      ]
    );
  };

  const getCategoriaInfo = (value: string) => {
    return CATEGORIAS_FIJAS.find((c) => c.value === value) ?? {
      label: value,
      bgColor: colors.neutral600,
    };
  };

  const renderGasto = ({ item }: { item: Gasto }) => {
    const cat = getCategoriaInfo(item.categoria);
    const fecha = new Date(item.fecha);
    return (
      <TouchableOpacity
        style={styles.gastoItem}
        onPress={() => router.push({ pathname: '/gasto/agregar', params: { id: item.id } })}
      >
        <View style={[styles.catDot, { backgroundColor: cat.bgColor }]} />
        <View style={styles.gastoInfo}>
          <Typo size={15} fontWeight="500">{item.descripcion || cat.label}</Typo>
          <Typo size={12} color={colors.neutral400}>
            {cat.label} · {fecha.getDate()}/{fecha.getMonth() + 1}
          </Typo>
        </View>
        <Typo size={16} fontWeight="700" color={colors.rose}>
          -${item.monto.toLocaleString()}
        </Typo>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Typo size={14} color={colors.neutral400}>Bienvenido,</Typo>
          <Typo size={20} fontWeight="700">{user?.name ?? 'Usuario'}</Typo>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Typo size={13} color={colors.neutral400}>Salir</Typo>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Tarjeta del mes */}
        <View style={styles.card}>
          <Typo size={14} color={colors.neutral400}>
            {MESES[mesActual]} {añoActual}
          </Typo>

          <Typo size={38} fontWeight="800" color={sobrePresupuesto ? colors.rose : colors.text}>
            ${total.toLocaleString()}
          </Typo>
          <Typo size={13} color={colors.neutral500}>total gastado este mes</Typo>

          {/* Presupuesto */}
          <View style={styles.presupuestoRow}>
            {presupuesto !== null ? (
              <>
                <Typo size={13} color={colors.neutral400}>
                  Presupuesto: ${presupuesto.toLocaleString()}
                </Typo>
                <TouchableOpacity onPress={() => { setInputPresupuesto(String(presupuesto)); setModalVisible(true); }}>
                  <PencilSimpleIcon size={16} color={colors.neutral500} />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.setPresupuestoBtn}>
                <PlusIcon size={14} color={colors.primary} />
                <Typo size={13} color={colors.primary} fontWeight="600"> Establecer presupuesto</Typo>
              </TouchableOpacity>
            )}
          </View>

          {/* Barra de progreso */}
          {presupuesto !== null && (
            <View style={styles.barraContainer}>
              <View style={styles.barraFondo}>
                <View style={[styles.barraRelleno, { width: `${porcentaje * 100}%` as any, backgroundColor: barColor }]} />
              </View>
              <Typo
                size={13}
                fontWeight="600"
                color={sobrePresupuesto ? colors.rose : colors.primary}
              >
                {sobrePresupuesto
                  ? `$${Math.abs(restante!).toLocaleString()} sobre el presupuesto`
                  : `$${restante!.toLocaleString()} restante`}
              </Typo>
            </View>
          )}

          {esFinalDeMes && (
            <View style={styles.alertBanner}>
              <Typo size={13} color={colors.neutral900} fontWeight="600">
                Fin de mes proximo — puedes cerrar el mes
              </Typo>
            </View>
          )}
        </View>

        {/* Gastos del mes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typo size={17} fontWeight="700">Gastos del mes</Typo>
            <Typo size={13} color={colors.neutral400}>{gastos.length} registros</Typo>
          </View>

          {gastos.length === 0 ? (
            <View style={styles.empty}>
              <Typo size={14} color={colors.neutral500}>Sin gastos este mes.</Typo>
              <Typo size={13} color={colors.neutral600}>Toca + para agregar uno.</Typo>
            </View>
          ) : (
            <FlatList
              data={gastos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())}
              keyExtractor={(item) => item.id}
              renderItem={renderGasto}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>

        {/* Cerrar mes */}
        <View style={styles.section}>
          <Boton onPress={handleCerrarMes} loading={cerrando} style={styles.cerrarBtn}>
            <Typo size={16} color={colors.neutral900} fontWeight="700">
              Cerrar mes manualmente
            </Typo>
          </Boton>
          <Typo size={12} color={colors.neutral600} style={{ textAlign: 'center' }}>
            El cierre automatico ocurre los primeros dias del mes siguiente.
          </Typo>
        </View>
      </ScrollView>

      {/* FAB agregar gasto */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/gasto/agregar')}>
        <PlusIcon size={28} color={colors.neutral900} weight="bold" />
      </TouchableOpacity>

      {/* Modal presupuesto */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Typo size={20} fontWeight="700">
              {presupuesto !== null ? 'Editar presupuesto' : 'Establecer presupuesto'}
            </Typo>
            <Typo size={14} color={colors.neutral400}>
              {MESES[mesActual]} {añoActual}
            </Typo>
            <View style={styles.inputContainer}>
              <TextInput
                value={inputPresupuesto}
                onChangeText={setInputPresupuesto}
                placeholder="Ej: 50000"
                placeholderTextColor={colors.neutral500}
                keyboardType="decimal-pad"
                style={styles.inputText}
                autoFocus
              />
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Typo size={16} color={colors.neutral400}>Cancelar</Typo>
              </TouchableOpacity>
              <Boton onPress={handleGuardarPresupuesto} style={styles.guardarBtn}>
                <Typo size={16} color={colors.neutral900} fontWeight="700">Guardar</Typo>
              </Boton>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral900,
    paddingTop: verticalScale(55),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacingX._20,
    marginBottom: spacingY._20,
  },
  logoutBtn: { padding: 8 },
  card: {
    marginHorizontal: spacingX._20,
    backgroundColor: colors.neutral800,
    borderRadius: radius._20,
    borderCurve: 'continuous',
    padding: spacingX._20,
    gap: 6,
    marginBottom: spacingY._20,
  },
  presupuestoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  setPresupuestoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barraContainer: {
    gap: 6,
    marginTop: 4,
  },
  barraFondo: {
    height: 8,
    backgroundColor: colors.neutral700,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barraRelleno: {
    height: '100%',
    borderRadius: 4,
  },
  alertBanner: {
    marginTop: spacingY._10,
    backgroundColor: colors.primary,
    borderRadius: radius._10,
    padding: 10,
    alignItems: 'center',
  },
  section: {
    marginHorizontal: spacingX._20,
    marginBottom: spacingY._25,
    gap: spacingY._10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gastoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  catDot: { width: 12, height: 12, borderRadius: 6 },
  gastoInfo: { flex: 1, gap: 2 },
  separator: {
    height: 1,
    backgroundColor: colors.neutral800,
    marginVertical: 4,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacingY._25,
    gap: 4,
  },
  cerrarBtn: { backgroundColor: colors.neutral700 },
  fab: {
    position: 'absolute',
    bottom: verticalScale(80),
    right: spacingX._20,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.neutral800,
    borderTopLeftRadius: radius._20,
    borderTopRightRadius: radius._20,
    padding: spacingX._20,
    gap: spacingY._15,
    paddingBottom: verticalScale(40),
  },
  inputContainer: {
    backgroundColor: colors.neutral700,
    borderRadius: radius._12,
    paddingHorizontal: 16,
    height: verticalScale(56),
    justifyContent: 'center',
  },
  inputText: {
    color: colors.text,
    fontSize: verticalScale(22),
    fontWeight: '700',
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  guardarBtn: { flex: 1 },
});
