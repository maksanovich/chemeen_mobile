import {
  StyleSheet,
  ScrollView
} from 'react-native';

import { ThemedView } from '@/components/ThemedView';

import MasterItem from '@/components/MasterItem';
import { MASTER_LIST } from '@/constants/Masters';
import { IMaster } from '@/constants/Interfaces';

export default function MasterScreen() {
  return (
    <ScrollView>
      <ThemedView style={styles.container}>
        {
          MASTER_LIST.map((item: IMaster, index: number) => (
            <MasterItem
              key={index}
              item={item}
              removable={false}
              onPressEvent={() => { }}
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
});
