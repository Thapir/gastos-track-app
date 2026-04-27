import Boton from '@/components/boton';
import BotonBack from '@/components/botonBack';
import ContenedorPantalla from '@/components/contenedorPantalla';
import Input from '@/components/input';
import Typo from '@/components/typo';
import { CATEGORIAS_FIJAS, COLORES_DISPONIBLES } from '@/constants/categorias';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { CategoriaCustom, gastosService } from '@/utils/gastosService';
import { verticalScale } from '@/utils/styling';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PlusIcon, TrashIcon, XIcon } from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const AgregarGasto = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { id: gastoId } = useLocalSearchParams<{ id?: string }>();
  const esEdicion = !!gastoId;

  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const [categoriasCustom, setCategoriasCustom] = useState<CategoriaCustom[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevaLabel, setNuevaLabel] = useState('');
  const [nuevoColor, setNuevoColor] = useState(COLORES_DISPONIBLES[0]);

  // Si es edicion, cargar datos del gasto
  useEffect(() => {
    if (!user?.uid) return;
    gastosService.getCategoriasCustom(user.uid).then(setCategoriasCustom);

    if (esEdicion) {
      gastosService.getAll(user.uid).then((todos) => {
        const gasto = todos.find((g) => g.id === gastoId);
        if (gasto) {
          setMonto(String(gasto.monto));
          setDescripcion(gasto.descripcion ?? '');
          setCategoriaSeleccionada(gasto.categoria);
          setFecha(gasto.fecha);
        }
      });
    }
  }, [user, gastoId]);

  const todasLasCategorias = [
    ...CATEGORIAS_FIJAS,
    ...categoriasCustom.map((c) => ({
      label: c.label,
      value: c.value,
      bgColor: c.bgColor,
      iconName: 'Tag',
    })),
  ];

  const handleGuardar = async () => {
    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) {
      Alert.alert('Monto invalido', 'Ingresa un monto valido mayor a 0.');
      return;
    }
    if (!categoriaSeleccionada) {
      Alert.alert('Categoria requerida', 'Selecciona una categoria.');
      return;
    }
    if (!user?.uid) return;

    setLoading(true);
    if (esEdicion) {
      await gastosService.editar(user.uid, gastoId!, {
        monto: Number(monto),
        categoria: categoriaSeleccionada,
        descripcion: descripcion.trim(),
        fecha,
      });
    } else {
      await gastosService.agregar(user.uid, {
        monto: Number(monto),
        categoria: categoriaSeleccionada,
        descripcion: descripcion.trim(),
        fecha,
      });
    }
    setLoading(false);
    router.back();
  };

  const handleEliminar = () => {
    Alert.alert(
      'Eliminar gasto',
      '¿Confirmas eliminar este gasto? Esta accion no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await gastosService.eliminar(user!.uid!, gastoId!);
            router.back();
          },
        },
      ]
    );
  };

  const handleAgregarCategoria = async () => {
    if (!nuevaLabel.trim()) {
      Alert.alert('Nombre requerido', 'Ingresa un nombre para la categoria.');
      return;
    }
    if (!user?.uid) return;
    const nueva = await gastosService.agregarCategoriaCustom(user.uid, {
      label: nuevaLabel.trim(),
      value: nuevaLabel.trim().toLowerCase().replace(/\s+/g, '_'),
      bgColor: nuevoColor,
    });
    setCategoriasCustom((prev) => [...prev, nueva]);
    setCategoriaSeleccionada(nueva.value);
    setNuevaLabel('');
    setModalVisible(false);
  };

  return (
    <ContenedorPantalla>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.topRow}>
          <BotonBack iconSize={26} />
          {esEdicion && (
            <TouchableOpacity onPress={handleEliminar} style={styles.deleteBtn}>
              <TrashIcon size={20} color={colors.rose} />
            </TouchableOpacity>
          )}
        </View>

        <Typo size={26} fontWeight="800" style={{ marginTop: spacingY._15 }}>
          {esEdicion ? 'Editar Gasto' : 'Agregar Gasto'}
        </Typo>

        {/* Monto */}
        <View style={styles.field}>
          <Typo size={14} color={colors.neutral400}>Monto</Typo>
          <Input
            placeholder="0.00"
            value={monto}
            onChangeText={setMonto}
            keyboardType="decimal-pad"
            inputStyle={{ fontSize: verticalScale(22), fontWeight: '700' }}
          />
        </View>

        {/* Descripcion */}
        <View style={styles.field}>
          <Typo size={14} color={colors.neutral400}>Descripcion (opcional)</Typo>
          <Input
            placeholder="Ej: almuerzo con amigos"
            value={descripcion}
            onChangeText={setDescripcion}
          />
        </View>

        {/* Fecha */}
        <View style={styles.field}>
          <Typo size={14} color={colors.neutral400}>Fecha (YYYY-MM-DD)</Typo>
          <Input
            placeholder="2025-04-01"
            value={fecha}
            onChangeText={setFecha}
            keyboardType="numeric"
          />
        </View>

        {/* Categorias */}
        <View style={styles.field}>
          <View style={styles.categoriaHeader}>
            <Typo size={14} color={colors.neutral400}>Categoria</Typo>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addCatBtn}>
              <PlusIcon size={14} color={colors.primary} />
              <Typo size={13} color={colors.primary} fontWeight="600"> Nueva</Typo>
            </TouchableOpacity>
          </View>

          <View style={styles.categoriasGrid}>
            {todasLasCategorias.map((cat) => {
              const seleccionada = categoriaSeleccionada === cat.value;
              return (
                <TouchableOpacity
                  key={cat.value}
                  onPress={() => setCategoriaSeleccionada(cat.value)}
                  style={[
                    styles.catChip,
                    { borderColor: seleccionada ? cat.bgColor : colors.neutral700 },
                    seleccionada && { backgroundColor: cat.bgColor + '30' },
                  ]}
                >
                  <View style={[styles.catDot, { backgroundColor: cat.bgColor }]} />
                  <Typo size={13} color={seleccionada ? colors.text : colors.neutral400}>
                    {cat.label}
                  </Typo>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Boton onPress={handleGuardar} loading={loading} style={{ marginTop: spacingY._10 }}>
          <Typo size={18} color={colors.neutral900} fontWeight="700">
            {esEdicion ? 'Guardar cambios' : 'Guardar gasto'}
          </Typo>
        </Boton>
      </ScrollView>

      {/* Modal nueva categoria */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typo size={18} fontWeight="700">Nueva categoria</Typo>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <XIcon size={22} color={colors.neutral400} />
              </TouchableOpacity>
            </View>

            <Typo size={13} color={colors.neutral400}>Nombre</Typo>
            <View style={{ backgroundColor: colors.neutral900, borderRadius: radius._12, paddingHorizontal: 14, height: verticalScale(48), justifyContent: 'center' }}>
              <TextInput
                value={nuevaLabel}
                onChangeText={setNuevaLabel}
                placeholder="Ej: Mascota"
                placeholderTextColor={colors.neutral500}
                style={{ color: colors.text, fontSize: 15 }}
              />
            </View>

            <Typo size={13} color={colors.neutral400}>Color</Typo>
            <View style={styles.coloresGrid}>
              {COLORES_DISPONIBLES.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setNuevoColor(color)}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    nuevoColor === color && styles.colorSeleccionado,
                  ]}
                />
              ))}
            </View>

            <Boton onPress={handleAgregarCategoria}>
              <Typo size={16} color={colors.neutral900} fontWeight="700">Crear categoria</Typo>
            </Boton>
          </View>
        </View>
      </Modal>
    </ContenedorPantalla>
  );
};

export default AgregarGasto;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacingX._20,
    paddingBottom: verticalScale(40),
    gap: spacingY._20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: colors.neutral800,
    padding: 8,
    borderRadius: radius._10,
  },
  field: { gap: spacingY._7 },
  categoriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addCatBtn: { flexDirection: 'row', alignItems: 'center' },
  categoriasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius._10,
    borderWidth: 1.5,
    borderCurve: 'continuous',
  },
  catDot: { width: 8, height: 8, borderRadius: 4 },
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coloresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorCircle: { width: 32, height: 32, borderRadius: 16 },
  colorSeleccionado: { borderWidth: 3, borderColor: colors.white },
});
