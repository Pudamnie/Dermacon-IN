import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Alert, TextInput, Modal, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '../../api/client';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SIZES } from '../../constants/theme';

export default function ProductsScreen() {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // New Product Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get('/products/my-products');
      setProducts(res.data.products);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const pickImage = async () => {
    if (images.length >= 3) {
      Alert.alert('Limit Reached', 'You can upload a maximum of 3 images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      // In a real app, you'd upload this to a server/Cloudinary first
      // For now, we'll prefix with data URL or simulate upload
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImages([...images, base64Img]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddProduct = async () => {
    if (!name || !description || !price || !category || !stock) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Error', 'Please upload at least 1 product image');
      return;
    }

    setSubmitting(true);
    try {
      const productData = {
        name,
        description,
        price: parseFloat(price),
        category,
        stock: parseInt(stock, 10),
        images: images,
      };

      if (isEditing && editingId) {
        await apiClient.put(`/products/${editingId}`, productData);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        await apiClient.post('/products/', productData);
        Alert.alert('Success', 'Product added successfully');
      }
      
      setModalVisible(false);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', isEditing ? 'Failed to update product' : 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (product: any) => {
    setIsEditing(true);
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setCategory(product.category);
    setStock(product.stock.toString());
    setImages(product.images || []);
    setModalVisible(true);
  };

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to remove this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/products/${productId}`);
              onRefresh();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setStock('');
    setImages([]);
  };

  const renderProduct = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <View style={styles.productImageContainer}>
        {item.images && item.images.length > 0 ? (
          <Image source={{ uri: item.images[0] }} style={styles.productImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="medical" size={48} color={COLORS.border} />
          </View>
        )}
        <TouchableOpacity 
          style={styles.deleteIconButton} 
          onPress={() => handleDeleteProduct(item.id)}
        >
          <Ionicons name="trash" size={18} color={COLORS.error} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.editIconButton} 
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="create" size={18} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{item.category}</Text>
        </View>
      </View>
      
      <View style={styles.productInfo}>
        <View style={styles.productHeaderRow}>
          <Text style={styles.productName}>{item.name}</Text>
          <View style={[styles.statusIndicator, { backgroundColor: item.is_active ? COLORS.success : COLORS.error }]} />
        </View>
        
        <Text style={styles.productDescription} numberOfLines={3}>{item.description}</Text>
        
        <View style={styles.productFooter}>
          <View>
            <Text style={styles.stockLabel}>Available Stock</Text>
            <Text style={[styles.stockValue, item.stock < 10 && { color: COLORS.error }]}>{item.stock} units</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceSymbol}>Rs.</Text>
            <Text style={styles.priceValue}>{item.price.toLocaleString()}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Products</Text>
          <Text style={styles.subtitle}>Manage your inventory</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color={COLORS.surface} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="cube-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>No products added yet.</Text>
            </View>
          }
        />
      )}

      {/* Add Product Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView 
          style={{ flex: 1, backgroundColor: COLORS.background }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{isEditing ? 'Edit Product' : 'Add New Product'}</Text>
            <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Sunscreen SPF 50" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Images (1-3)</Text>
              <View style={styles.imagePickerRow}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imagePreviewContainer}>
                    <Image source={{ uri }} style={styles.imagePreview} />
                    <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                      <Ionicons name="close-circle" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ))}
                {images.length < 3 && (
                  <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                    <Ionicons name="camera" size={32} color={COLORS.primary} />
                    <Text style={styles.imagePickerText}>{images.length}/3</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                value={description} 
                onChangeText={setDescription} 
                placeholder="Product details..." 
                multiline 
                numberOfLines={3} 
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: SIZES.sm }]}>
                <Text style={styles.label}>Price (Rs.)</Text>
                <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="0.00" keyboardType="decimal-pad" />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: SIZES.sm }]}>
                <Text style={styles.label}>Stock Quantity</Text>
                <TextInput style={styles.input} value={stock} onChangeText={setStock} placeholder="0" keyboardType="number-pad" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="e.g. Skincare, Medicine" />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddProduct} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color={COLORS.surface} />
              ) : (
                <Text style={styles.submitButtonText}>{isEditing ? 'Update Product' : 'Add Product'}</Text>
              )}
            </TouchableOpacity>
            
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.lg,
    paddingTop: SIZES.xxl * 1.2,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: COLORS.secondary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  listContainer: {
    padding: SIZES.md,
    paddingBottom: 100,
  },
  productCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.lg,
    marginBottom: SIZES.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  productImageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIconButton: {
    position: 'absolute',
    top: SIZES.md,
    right: SIZES.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  editIconButton: {
    position: 'absolute',
    top: SIZES.md,
    right: SIZES.md + 44,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: SIZES.md,
    left: SIZES.md,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: SIZES.xs,
  },
  categoryBadgeText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  productInfo: {
    padding: SIZES.lg,
  },
  productHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: SIZES.sm,
  },
  productDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SIZES.lg,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: SIZES.md,
  },
  stockLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  stockValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceSymbol: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: 2,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: SIZES.md,
    color: COLORS.textSecondary,
  },
  
  // Modal Styles
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalContent: {
    padding: SIZES.lg,
  },
  inputGroup: {
    marginBottom: SIZES.lg,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.sm,
    padding: SIZES.md,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.xs,
  },
  imagePickerButton: {
    width: 80,
    height: 80,
    borderRadius: SIZES.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  imagePickerText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  imagePreviewContainer: {
    width: 80,
    height: 80,
    marginRight: SIZES.sm,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: SIZES.sm,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
  },
  submitButton: {
    backgroundColor: COLORS.secondary,
    padding: SIZES.md,
    borderRadius: SIZES.sm,
    alignItems: 'center',
    marginTop: SIZES.md,
  },
  submitButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
