import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';
import { COLORS, SIZES } from '../../constants/theme';

export default function StoreScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Cart State
  const [cart, setCart] = useState<any[]>([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Product Detail State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get('/products/');
      setProducts(res.data.products);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    Alert.alert('Added to Cart', `${product.name} has been added.`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const placeOrder = async () => {
    if (cart.length === 0) return Alert.alert('Error', 'Cart is empty');
    if (!deliveryAddress) return Alert.alert('Error', 'Please enter a delivery address');

    setPlacingOrder(true);
    try {
      const pharmacies = [...new Set(cart.map(item => item.pharmacy_id))];
      
      for (const pharmacyId of pharmacies) {
        const pharmacyItems = cart.filter(item => item.pharmacy_id === pharmacyId);
        const total = pharmacyItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        await apiClient.post('/orders/', {
          pharmacy_id: pharmacyId,
          delivery_address: deliveryAddress,
          total_amount: total,
          items: pharmacyItems.map(item => ({
            product_id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        });
      }
      
      Alert.alert('Success', 'Your order has been placed successfully!');
      setCart([]);
      setCartVisible(false);
      setDeliveryAddress('');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to place order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const openProductDetail = (product: any) => {
    setSelectedProduct(product);
    setDetailVisible(true);
  };

  const renderProduct = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={() => openProductDetail(item)}
        style={styles.imageTouchable}
      >
        {item.images && item.images.length > 0 ? (
          <Image source={{ uri: item.images[0] }} style={styles.productImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="medical-outline" size={48} color={COLORS.border} />
          </View>
        )}
        <View style={styles.categoryTag}>
          <Text style={styles.categoryTagText}>{item.category || 'General'}</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.productInfo}>
        <View style={styles.brandRow}>
          <Ionicons name="business" size={12} color={COLORS.textSecondary} />
          <Text style={styles.pharmacyName}>{item.pharmacy_name}</Text>
        </View>
        
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        
        <View style={styles.productFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceSymbol}>Rs.</Text>
            <Text style={styles.priceValue}>{item.price.toLocaleString()}</Text>
          </View>
          
          <TouchableOpacity style={styles.addToCartBtn} onPress={() => addToCart(item)}>
            <Ionicons name="add" size={20} color={COLORS.surface} />
            <Text style={styles.addToCartBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Health Store</Text>
          <Text style={styles.subtitle}>Professional skincare & medicine</Text>
        </View>
        <TouchableOpacity style={styles.cartIcon} onPress={() => setCartVisible(true)}>
          <Ionicons name="cart-outline" size={30} color={COLORS.primary} />
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.reduce((s, i) => s + i.quantity, 0)}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          renderItem={renderProduct}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="cube-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>No products available right now.</Text>
            </View>
          }
        />
      )}

      {/* Cart Modal */}
      <Modal visible={cartVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Your Cart</Text>
            <TouchableOpacity onPress={() => setCartVisible(false)}>
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.cartList}>
            {cart.length === 0 ? (
              <Text style={styles.emptyCart}>Your cart is empty.</Text>
            ) : (
              cart.map((item, index) => (
                <View key={index} style={styles.cartItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemPharmacy}>Sold by: {item.pharmacy_name}</Text>
                    <Text style={styles.cartItemPrice}>Rs. {item.price.toFixed(2)} x {item.quantity}</Text>
                  </View>
                  <Text style={styles.cartItemTotal}>Rs. {(item.price * item.quantity).toFixed(2)}</Text>
                  <TouchableOpacity onPress={() => removeFromCart(item.id)} style={{ marginLeft: 15 }}>
                    <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>

          {cart.length > 0 && (
            <View style={styles.checkoutSection}>
              <Text style={styles.totalText}>Total: Rs. {cartTotal.toFixed(2)}</Text>
              
              <Text style={styles.label}>Delivery Address</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter full address" 
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
              />
              
              <TouchableOpacity style={styles.checkoutButton} onPress={placeOrder} disabled={placingOrder}>
                {placingOrder ? (
                  <ActivityIndicator color={COLORS.surface} />
                ) : (
                  <Text style={styles.checkoutButtonText}>Place Order</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* Product Detail Modal */}
      <Modal visible={detailVisible} animationType="fade" transparent={true}>
        <View style={styles.detailOverlay}>
          <View style={styles.detailCard}>
            <TouchableOpacity style={styles.closeDetail} onPress={() => setDetailVisible(false)}>
              <Ionicons name="close-circle" size={32} color={COLORS.text} />
            </TouchableOpacity>
            
            {selectedProduct && (
              <ScrollView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled style={styles.detailImageScroll}>
                  {selectedProduct.images && selectedProduct.images.map((img: string, i: number) => (
                    <Image key={i} source={{ uri: img }} style={styles.detailImage} />
                  ))}
                </ScrollView>
                
                <View style={styles.detailInfo}>
                  <Text style={styles.detailName}>{selectedProduct.name}</Text>
                  <View style={styles.detailBrandRow}>
                    <Ionicons name="business" size={14} color={COLORS.primary} />
                    <Text style={styles.detailPharmacyName}>Sold by: {selectedProduct.pharmacy_name}</Text>
                  </View>
                  <Text style={styles.detailCategory}>{selectedProduct.category}</Text>
                  <Text style={styles.detailPrice}>Rs. {selectedProduct.price.toFixed(2)}</Text>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailDescription}>{selectedProduct.description}</Text>
                  
                  <TouchableOpacity 
                    style={styles.detailAddButton} 
                    onPress={() => {
                      addToCart(selectedProduct);
                      setDetailVisible(false);
                    }}
                  >
                    <Text style={styles.detailAddButtonText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SIZES.lg, paddingTop: SIZES.xxl * 1.2, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  cartIcon: { padding: 8, position: 'relative' },
  cartBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: COLORS.error, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText: { color: COLORS.surface, fontSize: 10, fontWeight: 'bold' },
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
  imageTouchable: {
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
  categoryTag: {
    position: 'absolute',
    top: SIZES.md,
    left: SIZES.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  productInfo: {
    padding: SIZES.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pharmacyName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: SIZES.md,
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
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SIZES.md,
    paddingVertical: 8,
    borderRadius: SIZES.sm,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addToCartBtnText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.xl },
  emptyText: { color: COLORS.textSecondary },
  modalContainer: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.surface },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  cartList: { flex: 1, padding: SIZES.md },
  emptyCart: { textAlign: 'center', marginTop: 40, color: COLORS.textSecondary, fontSize: 16 },
  cartItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: SIZES.md, borderRadius: SIZES.sm, marginBottom: SIZES.sm },
  cartItemName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  cartItemPrice: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  cartItemTotal: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  checkoutSection: { padding: SIZES.lg, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border, paddingBottom: 100 },
  totalText: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.md },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: SIZES.xs },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.sm, padding: SIZES.md, fontSize: 16, marginBottom: SIZES.lg },
  checkoutButton: { backgroundColor: COLORS.secondary, padding: SIZES.md, borderRadius: SIZES.sm, alignItems: 'center' },
  checkoutButtonText: { color: COLORS.surface, fontSize: 16, fontWeight: 'bold' },

  // Detail Modal Styles
  detailOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: SIZES.lg },
  detailCard: { width: '100%', maxHeight: '80%', backgroundColor: COLORS.surface, borderRadius: SIZES.lg, overflow: 'hidden', position: 'relative' },
  closeDetail: { position: 'absolute', top: 10, right: 10, zIndex: 10 },
  detailImageScroll: { height: 250 },
  detailImage: { width: 340, height: 250, resizeMode: 'cover' },
  detailInfo: { padding: SIZES.lg },
  detailName: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  detailCategory: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SIZES.sm },
  detailPrice: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary, marginBottom: SIZES.md },
  detailLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.xs },
  detailDescription: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SIZES.xl },
  detailAddButton: { backgroundColor: COLORS.primary, padding: SIZES.md, borderRadius: SIZES.sm, alignItems: 'center' },
  detailAddButtonText: { color: COLORS.surface, fontSize: 16, fontWeight: 'bold' },
  detailBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  detailPharmacyName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 6,
  },
  cartItemPharmacy: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontStyle: 'italic',
  },
});
