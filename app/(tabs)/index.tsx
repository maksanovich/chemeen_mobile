import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import SearchPI from '@/components/PI/Search';
import FilterPI from '@/components/PI/FilterPI';
import PI from '@/components/PI/Item';

import axiosInstance from '@/utils/axiosInstance';
import { getPIList } from '@/utils/utils';

import { useDispatch, useSelector } from '@/store';
import { initialItem } from '@/store/reducers/PIList';
import { initialSelectedPIItem } from '@/store/reducers/selectedPI';

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { items } = useSelector((state) => state.PI);
  const selectedPI: any = useSelector((state) => state.selectedPI.data);

  const screenWidth = Dimensions.get('window').width;
  const leftPosition = screenWidth / 2 - 50;

  const [PIList, setPIList] = useState<any[]>([]);
  const [filteredPIList, setFilteredPIList] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getPIs();
  }, [])

  useEffect(() => {
    const result = getPIList(items);
    setPIList(result);
  }, [items])

  useEffect(() => {
    // Check if filtered data exists in Redux (even if empty array)
    if (selectedPI.hasOwnProperty('filteredPIList')) {
      // Use filtered data from Redux (even if empty)
      const filteredData = getPIList(selectedPI.filteredPIList || []);
      const searchFiltered = filteredData.filter(item =>
        item.No.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredPIList(searchFiltered);
    } else {
      // No filter applied, use original data with search
      const newData = PIList.filter(item =>
        item.No.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredPIList(newData);
    }
  }, [search, PIList, selectedPI.filteredPIList])

  const getPIs = async () => {
    const response = await axiosInstance.get('product/PI');
    dispatch(initialItem(response.data));
  }

  const handleCreate = () => {
    dispatch(initialSelectedPIItem({}));
    router.navigate('/product');
  }

  return (
    <ThemedView style={styles.container}>
      <SearchPI
        search={search}
        setSearch={setSearch}
      />
      <FilterPI />
      <ScrollView>
        {
          filteredPIList.length > 0 ?
            filteredPIList.map((item, index) => (
              <PI
                key={index}
                item={item}
              />
            )) :
            <ThemedText style={styles.noExist}>Nothing to show.</ThemedText>
        }
      </ScrollView>
      <TouchableOpacity
        style={[styles.buttonContainer, { left: leftPosition }]}
        onPress={handleCreate}
      >
        <ThemedText style={styles.buttonText}> Create </ThemedText>
      </TouchableOpacity>
    </ThemedView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: '0%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
    backgroundColor: '#6235b6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
    width: 100,
    height: 40
  },
  noExist: {
    textAlign: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
