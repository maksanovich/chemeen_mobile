import { StyleSheet, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import ProductItem from '@/components/ProductItem';

import { PRODUCT_LIST } from '@/constants/Products';

import { useSelector, useDispatch } from '@/store';
import { setSelectedPIItem } from '@/store/reducers/selectedPI';
import axiosInstance from '@/utils/axiosInstance';

export default function ProductScreen() {
  const selectedPI: any = useSelector((state) => state.selectedPI.data);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);

  // Reload all data when component mounts or PIId changes
  useEffect(() => {
    const reloadAllData = async () => {
      if (selectedPI.PIId) {
        setLoading(true);
        try {
          // Fetch all related data in parallel
          const [
            itemResponse,
            codeListResponse,
            traceAbilityResponse,
            barResponse,
            elisaResponse
          ] = await Promise.all([
            axiosInstance.get(`product/item/merged/${selectedPI.PIId}`).catch(() => ({ data: [] })),
            axiosInstance.get(`product/codeList/pi/${selectedPI.PIId}`).catch(() => ({ data: [] })),
            axiosInstance.get(`product/traceAbility?type=formatted&PIId=${selectedPI.PIId}`).catch(() => ({ data: [] })),
            axiosInstance.get(`product/bar/${selectedPI.PIId}`).catch(() => ({ data: [] })),
            axiosInstance.get(`product/elisa/${selectedPI.PIId}`).catch(() => ({ data: [] }))
          ]);

          // Update Redux state with all fetched data
          const updatedData = {
            item: itemResponse.data || [],
            codeList: codeListResponse.data || [],
            traceAbility: traceAbilityResponse.data || [],
            BAR: barResponse.data || [],
            elisa: elisaResponse.data || []
          };

          dispatch(setSelectedPIItem(updatedData));
        } catch (error) {
          console.error('Error reloading data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    reloadAllData();
  }, [selectedPI.PIId, dispatch]);
  return (
    <ScrollView>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.textCenter}>
          {
            selectedPI.PIId ?
              <ThemedText type='subtitle'>Invoice Number: {selectedPI?.PI?.PINo}</ThemedText> :
              <ThemedText>Create Document</ThemedText>
          }
          {loading && (
            <ThemedText style={styles.loadingText}>Reloading data...</ThemedText>
          )}
        </ThemedView>
        {
          PRODUCT_LIST.map((item: any, index: number) => (
            <ProductItem
              key={index}
              item={item}
              onPressEvent={() => { }}
              enable={() => {
                const currentReduxKey: string = item.reduxKey;
                const beforeReduxKey: string = PRODUCT_LIST[index - 1]?.reduxKey;

                if (currentReduxKey === 'PI' && !beforeReduxKey) {
                  return true;
                }
                
                const currentData = selectedPI[currentReduxKey];
                const beforeData = selectedPI[beforeReduxKey];

                const isCurrentEmpty =
                  Array.isArray(currentData) ? currentData.length === 0 : !currentData || Object.keys(currentData).length === 0;

                const isBeforeEmpty =
                  Array.isArray(beforeData) ? beforeData.length === 0 : !beforeData || Object.keys(beforeData).length === 0;

                if (isCurrentEmpty && isBeforeEmpty) {
                  return false;
                }
                return true;
              }}
            />
          ))
        }
      </ThemedView>
    </ScrollView >
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20
  },
  textCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 5
  },
});
