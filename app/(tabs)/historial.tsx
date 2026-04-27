import Typo from '@/components/typo';
import { CATEGORIAS_FIJAS } from '@/constants/categorias';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { Gasto, MesCerrado, gastosService } from '@/utils/gastosService';
import { verticalScale } from '@/utils/styling';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

const Historial = () => {
  const { user } = useAuth();
  const [meses, setMeses] = useState<MesCerrado[]>([]);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = useCallback(async () => {
    if (!user?.uid) return;
    const data = await gastosService.getMesesCerrados(user.uid);
    setMeses(data);
  }, [user]);

  // Recargar cada vez que el tab obtiene el foco
  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const onRefresh = async () => {
    setRefreshing(true);
    await cargar();
    setRefreshing(false);
  };

  const toggleExpandir = (key: string) => {
    setExpandido((prev) => (prev === key ? null : key));
  };

  const getCategoriaLabel = (value: string) => {
    return CATEGORIAS_FIJAS.find((c) => c.value === value)?.label ?? value;
  };

  const getCategoriaColor = (value: string) => {
    return CATEGORIAS_FIJAS.find((c) => c.value === value)?.bgColor ?? colors.neutral600;
  };

  const renderGasto = (gasto: Gasto) => (
    <View key={gasto.id} style={styles.gastoItem}>
      <View style={[styles.catDot, { backgroundColor: getCategoriaColor(gasto.categoria) }]} />
      <View style={{ flex: 1 }}>
        <Typo size={14}>{gasto.descripcion || getCategoriaLabel(gasto.categoria)}</Typo>
        <Typo size={12} color={colors.neutral500}>{getCategoriaLabel(gasto.categoria)}</Typo>
      </View>
      <Typo size={14} fontWeight="600" color={colors.rose}>
        -${gasto.monto.toLocaleString()}
      </Typo>
    </View>
  );

  const renderMes = ({ item }: { item: MesCerrado }) => {
    const key = `${item.año}-${item.mes}`;
    const abierto = expandido === key;

    // Agrupar por categoria
    const porCategoria: Record<string, number> = {};
    item.gastos.forEach((g) => {
      porCategoria[g.categoria] = (porCategoria[g.categoria] ?? 0) + g.monto;
    });

    return (
      <View style={styles.mesCard}>
        <TouchableOpacity onPress={() => toggleExpandir(key)} style={styles.mesHeader}>
          <View>
            <Typo size={18} fontWeight="700">
              {MESES[item.mes]} {item.año}
            </Typo>
            <Typo size={13} color={colors.neutral400}>
              {item.gastos.length} gastos registrados
            </Typo>
          </View>
          <View style={styles.totalContainer}>
            <Typo size={20} fontWeight="800" color={colors.rose}>
              ${item.total.toLocaleString()}
            </Typo>
            <Typo size={12} color={colors.neutral500}>{abierto ? 'Cerrar' : 'Ver detalle'}</Typo>
          </View>
        </TouchableOpacity>

        {abierto && (
          <View style={styles.detalle}>
            {/* Resumen por categoria */}
            <Typo size={14} color={colors.neutral400} fontWeight="600" style={{ marginBottom: 6 }}>
              Por categoria
            </Typo>
            {Object.entries(porCategoria).map(([cat, monto]) => (
              <View key={cat} style={styles.catRow}>
                <View style={[styles.catDot, { backgroundColor: getCategoriaColor(cat) }]} />
                <Typo size={14} style={{ flex: 1 }}>{getCategoriaLabel(cat)}</Typo>
                <Typo size={14} fontWeight="600">${monto.toLocaleString()}</Typo>
              </View>
            ))}

            <View style={styles.divisor} />

            {/* Lista de gastos */}
            <Typo size={14} color={colors.neutral400} fontWeight="600" style={{ marginBottom: 6 }}>
              Todos los gastos
            </Typo>
            {item.gastos
              .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
              .map(renderGasto)}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Typo size={24} fontWeight="800">Historial</Typo>
        <Typo size={14} color={colors.neutral400}>{meses.length} meses cerrados</Typo>
      </View>

      <FlatList
        data={meses}
        keyExtractor={(item) => `${item.año}-${item.mes}`}
        renderItem={renderMes}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Typo size={15} color={colors.neutral500}>Sin meses cerrados aun.</Typo>
            <Typo size={13} color={colors.neutral600}>
              Cierra un mes desde el Dashboard para verlo aqui.
            </Typo>
          </View>
        }
      />
    </View>
  );
};

export default Historial;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral900,
    paddingTop: verticalScale(55),
  },
  header: {
    paddingHorizontal: spacingX._20,
    marginBottom: spacingY._20,
    gap: 4,
  },
  lista: {
    paddingHorizontal: spacingX._20,
    gap: spacingY._15,
    paddingBottom: 20,
  },
  mesCard: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._20,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  mesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacingX._20,
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  detalle: {
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._15,
    gap: 4,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 3,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  gastoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 5,
  },
  divisor: {
    height: 1,
    backgroundColor: colors.neutral700,
    marginVertical: spacingY._10,
  },
  empty: {
    alignItems: 'center',
    paddingTop: verticalScale(80),
    gap: 8,
  },
});
