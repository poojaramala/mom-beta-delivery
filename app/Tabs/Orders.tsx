import { router } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { useOrders } from '../../context/orderContext';
import { useLocation } from '@/context/locatonContext';

const screenWidth = Dimensions.get('window').width;

const DeliveryDashboard = () => {
  const {
    orders,
    loadingOrders,
    acceptingOrderId,
    error,
    acceptOrder,
    rejectedOrderIds,
    rejectOrder,
  } = useOrders();

  const { locationCoords } = useLocation();

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d.toFixed(2);
  };

  const confirmedOrders = orders
    .filter(
      (o) =>
        o.status === 'confirmed' &&
        !o.deliveryboy_id &&
        !rejectedOrderIds.includes(o._id)
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 2);

  const handleAccept = (id) => {
    acceptOrder(id, () => {
      router.push('/delivery/pickup');
    });
  };

  const renderItem = (item) => {
    if (item.status !== 'confirmed' || item.deliveryboy_id) return null;

    const customerLocation = item.address_id?.currentLocation;

    const distance =
      customerLocation && locationCoords
        ? getDistance(
            locationCoords.latitude,
            locationCoords.longitude,
            customerLocation.latitude,
            customerLocation.longitude
          )
        : null;

    return (
      <View key={item._id} style={styles.orderCard}>
        <Text style={styles.orderText}>Order ID: {item._id}</Text>
        <Text style={styles.orderText}>Total: ₹{item.total_amount}</Text>
        {distance && (
          <Text style={styles.orderText}>Distance: {distance} km</Text>
        )}
        <View style={styles.btns}>
          <TouchableOpacity
            style={[
              styles.button,
              acceptingOrderId === item._id && styles.acceptButtonDisabled,
            ]}
            onPress={() => handleAccept(item._id)}
            disabled={acceptingOrderId === item._id}
          >
            <Text style={styles.textBtn}>
              {acceptingOrderId === item._id ? 'Accepting...' : 'Accept Order'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => rejectOrder(item._id)}
          >
            <Text style={styles.textBtn}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={{ backgroundColor: '#D0E8E6', marginBottom: 40 }}>
      <View style={styles.container}>
        <Text style={styles.currentText}>Current Order</Text>

        {loadingOrders && <ActivityIndicator size="large" color="#0000ff" />}
        {error && <Text style={styles.errorText}>{error}</Text>}
        {!loadingOrders && confirmedOrders.length === 0 && (
          <Text style={styles.noOrdersText}>
            No available orders at the moment.
          </Text>
        )}

        {confirmedOrders.map(renderItem)}

        <View style={styles.pastOrders}>
          <Text style={styles.pasttxt}>Past Orders</Text>
          <Text style={styles.pasttxt2}>Last order 2 mins ago</Text>

          <View style={styles.pastCod}>
            <Text style={styles.pastDetails}>01:10 am</Text>
            <Text style={styles.pastCodetxt}>COD</Text>
          </View>
          <Text style={styles.pasttxt2}>Order ID: #DK3KBDKF550083S</Text>
          <View style={styles.divider} />

          <View style={styles.pastCod}>
            <Text style={styles.pastDetails}>12:30 pm</Text>
            <Text style={styles.pastCodetxt}>COD</Text>
          </View>
          <Text style={styles.pasttxt2}>Order ID: #DK3KBDKF550902</Text>
          <View style={styles.divider} />

          <View style={styles.pastCod}>
            <Text style={styles.pastDetails}>9:10 pm</Text>
            <Text style={styles.pastCodetxt}>COD</Text>
          </View>
          <Text style={styles.pasttxt2}>Order ID: #DKHSHDKF550083S</Text>
          <View style={styles.divider} />

          <View style={styles.pastCod}>
            <Text style={styles.pastDetails}>11:10 am</Text>
            <Text style={styles.pastCodetxt}>COD</Text>
          </View>
          <Text style={styles.pasttxt2}>Order ID: #DKHSHDKF550899S</Text>
          <View style={styles.divider} />

        </View>
      </View>
    </ScrollView>
  );
};

export default DeliveryDashboard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#D0E8E6',
    flex: 1,
    padding: 10,
  },
  currentText: {
    fontSize: 20,
    fontWeight: '500',
    marginTop: 0,
    marginLeft: 20,
  },
  orderCard: {
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    elevation: 2,
  },
  orderText: {
    marginBottom: 5,
    fontSize: 16,
  },
  btns: {
    flexDirection: 'row',
    gap: 60,
    justifyContent: 'center',
    padding: 5,
  },
  button: {
    backgroundColor: '#00808088',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  textBtn: {
    color: 'white',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  noOrdersText: {
    fontSize: 16,
    fontStyle: 'italic',
    marginLeft: 20,
    marginTop: 10,
  },
  pastOrders: {
    backgroundColor: 'white',
    height: 451,
    width: 395,
    marginTop: 180,
    alignSelf: 'center',
    borderRadius: 30,
    paddingHorizontal: 10,
  },
  pasttxt: {
    fontSize: 20,
    fontWeight: '500',
    marginLeft: 22,
    marginTop: 20,
  },
  pasttxt2: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 22,
    marginTop: 7,
    color: 'grey',
  },
  pastDetails: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 22,
    marginTop: 20,
  },
  pastCod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 20,
  },
  pastCodetxt: {
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 5,
    marginTop: 15,
    padding: 6,
    color: '#008080',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
    marginHorizontal: 22,
  },
});
