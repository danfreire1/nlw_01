import React, { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation, NavigationContainer } from '@react-navigation/native'
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, Image, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import * as location from 'expo-location';
import api from '../../services/api';

interface Item {
  id: number,
  titulo: string,
  imagem_url: string,
};

interface Point {
  id: number,
  nome: string,
  imagem: string,
  latitude: number,
  longitude: number
} 

const Points = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [points, setPoints] = useState<Point[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const [posicaoInicial, setPosicaoInicial] = useState<[number, number]>([0,0]);

    const navegacao = useNavigation();

    useEffect(() => {
      async function carregarPosicao() {
        // Vai realizar um alert para confirmar se o usuário dá permissão da localização
        const { status } = await location.requestPermissionsAsync();

        if(status !== 'granted') {
          Alert.alert('Oooops...', 'Precisamos de sua permissão para obter a localização');
          return;
        }

        // Vai trazer a posição do usuário
        const localizacao = await location.getCurrentPositionAsync();

        const { latitude, longitude } = localizacao.coords;

        setPosicaoInicial ([
          latitude,
          longitude
        ]);
      }

      carregarPosicao();
    }, []);

    useEffect(() => {
      api.get('items').then(response => {
        setItems(response.data);
      });
    }, []);

    useEffect(() => {
      api.get('points', {
        params: {
          cidade: 'Santana de Parnaíba',
          uf: 'SP',
          items: [1, 2]
        }
      }).then(response => {
        setPoints(response.data);
      })
    }, []);

    function voltarTela() {
        navegacao.goBack();
    }

    function detalhePontoColeta(id: number) {
        navegacao.navigate('Detail', { id_ponto: id });
    }

    function itemSelecionado(id: number) {
      const alreadySelected = selectedItems.findIndex(item => item === id);

      if(alreadySelected >= 0) {
          const itemsFiltrados = selectedItems.filter(item => item !== id);

          setSelectedItems(itemsFiltrados);
      } else {
          setSelectedItems([ ...selectedItems, id ]);
      }
    }

    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity onPress={voltarTela}>
                    <Icon name="arrow-left" size={20} color="#34cb79" />
                </TouchableOpacity>

                <Text style={styles.title}>Bem vindo.</Text>
                <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

                <View style={styles.mapContainer}>
                    { posicaoInicial[0] !== 0 && (
                      <MapView 
                          style={styles.map} 
                          initialRegion={{
                              latitude: posicaoInicial[0],
                              longitude: posicaoInicial[1],
                              latitudeDelta: 0.014,
                              longitudeDelta: 0.014,
                          }}
                      >
                          {points.map(point => (
                            <Marker 
                                key={String(point.id)}
                                style={styles.mapMarker}
                                onPress={() => detalhePontoColeta(point.id)}
                                coordinate={{
                                    latitude: point.latitude,   
                                    longitude: point.longitude,
                                }} 
                            >
                              <View style={styles.mapMarkerContainer}>
                                  <Image 
                                      style={styles.mapMarkerImage} 
                                      source={{ uri: point.imagem }} 
                                  />
                                  <Text style={styles.mapMarkerTitle}>{point.nome}</Text>
                              </View>
                            </Marker>
                          ))}
                      </MapView>
                    )}
                </View>
            </View>
            <View style={styles.itemsContainer}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}    
                >
                    {items.map(item => (
                      <TouchableOpacity 
                        key={String(item.id)} 
                        style={[
                          styles.item,
                          selectedItems.includes(item.id) ? styles.selectedItem : {}
                        ]} 
                        onPress={() => itemSelecionado(item.id)}
                        activeOpacity={0.6}
                      >
                          <SvgUri width={42} height={42} uri={item.imagem_url} />
                          <Text style={styles.itemTitle}>{item.titulo}</Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </>
    );  
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 32,
      paddingTop: 20 + Constants.statusBarHeight,
    },
  
    title: {
      fontSize: 20,
      fontFamily: 'Ubuntu_700Bold',
      marginTop: 24,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 4,
      fontFamily: 'Roboto_400Regular',
    },
  
    mapContainer: {
      flex: 1,
      width: '100%',
      borderRadius: 10,
      overflow: 'hidden',
      marginTop: 16,
    },
  
    map: {
      width: '100%',
      height: '100%',
    },
  
    mapMarker: {
      width: 90,
      height: 80, 
    },
  
    mapMarkerContainer: {
      width: 90,
      height: 70,
      backgroundColor: '#34CB79',
      flexDirection: 'column',
      borderRadius: 8,
      overflow: 'hidden',
      alignItems: 'center'
    },
  
    mapMarkerImage: {
      width: 90,
      height: 45,
      resizeMode: 'cover',
    },
  
    mapMarkerTitle: {
      flex: 1,
      fontFamily: 'Roboto_400Regular',
      color: '#FFF',
      fontSize: 13,
      lineHeight: 23,
    },
  
    itemsContainer: {
      flexDirection: 'row',
      marginTop: 16,
      marginBottom: 32,
    },
  
    item: {
      backgroundColor: '#fff',
      borderWidth: 2,
      borderColor: '#eee',
      height: 120,
      width: 120,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 16,
      marginRight: 8,
      alignItems: 'center',
      justifyContent: 'space-between',
  
      textAlign: 'center',
    },
  
    selectedItem: {
      borderColor: '#34CB79',
      borderWidth: 2,
    },
  
    itemTitle: {
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      fontSize: 13,
    },
  });

export default Points;