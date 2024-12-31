import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

interface User {
  name: {
    first: string;
    last: string;
  };
  email: string;
}

interface ApiResponse {
  results: User[];
  info: {
    page: number;
  };
}

const PaginatedList: React.FC = () => {
  const [data, setData] = useState<User[]>([]);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // Error state

  const opacity = useSharedValue(0);

  const fetchPageData = useCallback(async (pageNumber: number): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://randomuser.me/api/?results=10&page=${pageNumber}`
      );
      const result: ApiResponse = await response.json();
      if (result.results.length === 0) {
        setHasMore(false);
      } else {
        setData((prevData) => [...prevData, ...result.results]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError("Failed to load data");  // Display error message
    }
    setIsLoading(false);
    opacity.value = withTiming(1, { duration: 500 });
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    if (
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 150 && // Adjusted threshold for buffer
      hasMore &&
      !isLoading
    ) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    fetchPageData(page);
  }, [page, fetchPageData]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opacity.value, [0, 1], [0, 1]),
  }));

  return (
    <ScrollView
      onScroll={handleScroll}
      scrollEventThrottle={16}
      contentContainerStyle={styles.scrollView}
    >
      {data.map((item, index) => (
        <View key={index} style={[styles.card, animatedStyle]}>
          <Text style={styles.name}>
            {item.name.first} {item.name.last}
          </Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
      ))}

      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="blue" />
        </View>
      )}

      {!hasMore && !isLoading && (
        <View style={styles.noMoreData}>
          <Text>No more data available</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    paddingVertical: 20,
  },
  card: {
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: 'gray',
  },
  loader: {
    marginVertical: 20,
    alignItems: 'center',
  },
  noMoreData: {
    alignItems: 'center',
    marginVertical: 20,
  },
  errorContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
});

export default PaginatedList;



// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   StyleSheet,
//   FlatList,
// } from 'react-native';
// import { InView } from 'react-native-intersection-observer';

// // Type for a single user record from the API
// interface User {
//   name: {
//     first: string;
//     last: string;
//   };
//   email: string;
// }

// // Type for API response
// interface ApiResponse {
//   results: User[];
//   info: {
//     page: number;
//   };
// }

// const PaginatedList: React.FC = () => {
//   const [data, setData] = useState<User[]>([]); // All data fetched so far
//   const [page, setPage] = useState<number>(1); // Current page
//   const [isLoading, setIsLoading] = useState<boolean>(false); // Loading indicator
//   const [hasMore, setHasMore] = useState<boolean>(true); // Whether more pages are available

//   const fetchPageData = async (pageNumber: number): Promise<void> => {
//     setIsLoading(true);
//     try {
//       const response = await fetch(
//         `https://randomuser.me/api/?results=10&page=${pageNumber}`
//       );
//       const result: ApiResponse = await response.json();

//       // Check if we have more data
//       if (result.results.length === 0) {
//         setHasMore(false);
//       } else {
//         setData((prevData) => [...prevData, ...result.results]);
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     }
//     setIsLoading(false);
//   };

//   useEffect(() => {
//     fetchPageData(page); // Fetch data when the page changes
//   }, [page]);

//   // Handler when the bottom sentinel comes into view
// //   const {ref,inView} = useInView()
//   const handleIntersection = (inView: boolean): void => {
//     if (inView && hasMore && !isLoading) {
//       setPage((prevPage) => prevPage + 1);
//     }
//   };

//   return (
//     <FlatList
//       data={data}
//       keyExtractor={(_, index) => index.toString()}
//       contentContainerStyle={styles.listContainer}
//       renderItem={({ item }) => (
//         <View style={styles.card}>
//           <Text style={styles.name}>
//             {item.name.first} {item.name.last}
//           </Text>
//           <Text style={styles.email}>{item.email}</Text>
//         </View>
//       )}
//       ListFooterComponent={() => (
//         <View style={styles.footer}>
//           {isLoading ? (
//             <ActivityIndicator size="large" color="blue" />
//           ) : hasMore ? (
//             <View onChange={handleIntersection}>
//               <View style={styles.sentinel}>
//                 <Text>Loading more...</Text>
//               </View>
//             </View>
//           ) : (
//             <Text>No more data available</Text>
//           )}
//         </View>
//       )}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   listContainer: {
//     paddingVertical: 20,
//   },
//   card: {
//     padding: 20,
//     marginVertical: 10,
//     marginHorizontal: 20,
//     backgroundColor: 'white',
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   name: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   email: {
//     fontSize: 14,
//     color: 'gray',
//   },
//   footer: {
//     alignItems: 'center',
//     marginVertical: 20,
//   },
//   sentinel: {
//     height: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// export default PaginatedList;
