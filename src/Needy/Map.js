import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { allBranches } from "../saylaniBranchData";
import * as Location from "expo-location";
import { auth } from "../config/firebase";
export default function Maps({  navigation }) {
  console.log(allBranches);
  const { uid } = auth.currentUser?.uid;
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [userLat, setUserLat] = useState(24.8607);
  const [userLong, setUserLong] = useState(67.0011);
  const [area, setArea] = useState(0);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setUserLat(location?.coords?.latitude);
      setUserLong(location?.coords?.longitude);
    })();
  }, []);



  //This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
  function calcCrow(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
  }

  console.log(
    calcCrow(
      userLat,
      userLong,
      allBranches[1].latitude,
      allBranches[1].longitude
    ).toFixed(1)
  );

  useEffect(() => {
    let neartestLoc = [];
    allBranches.map((val, ind) => {
      neartestLoc.push(
        calcCrow(userLat, userLong, val.latitude, val.longitude).toFixed(1)
      );
      const smallest = [neartestLoc[0]];
      if (neartestLoc[ind] < smallest) {
        setArea(allBranches[ind]);
      }
      // console.log(val.latitude);
    });
  }, [userLat, userLong]);
  console.log("area", area);

  // Converts numeric degrees to radians
  function toRad(Value) {
    return (Value * Math.PI) / 180;
  }

  console.log(location,"location");
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 3 }}>
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: userLat,
            longitude: userLong,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {allBranches.map((val, ind) => {
            return (
              
              <Marker
                key={ind}
                coordinate={{
                  latitude: val.latitude,
                  longitude: val.longitude,
                }}
                title={val.branch_name}
                description={val.branch_name}
              />
      
            );
          })}
                  <Marker
              // key={ind}
              coordinate={{
                latitude: userLat,
                longitude: userLong,
              }}
              title={"Home"}
              pinColor = {"green"} // any color
              description={"Home Sweet Home"}
            />
        </MapView>
      </View>

      <View
        style={{ flex: 1 }}
        // animation="fadeInUpBig"
      >
        <View
          style={{
            backgroundColor: "#eee",
            flex: 1,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            padding: 8,
          }}
        >
          <Text
            style={{ fontWeight: "bold", fontSize: 15, marginHorizontal: 8 }}
          >
            Nearest Branch Location
          </Text>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 15,
              marginHorizontal: 8,
              borderColor: "lightgrey",
              borderWidth: 1,
              borderStyle: "solid",
              padding: 8,
              marginTop: 8,
            }}
          >
            {area ? area.branch_name : "Main Branch"}
          </Text>

          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Send Request")
            }}
            style={{
              alignItems: "center",
              marginVertical: 5,
            }}
          >
            <Text
              style={{
                color: "black",
                padding: 8,
                backgroundColor: "#89C343",
                width: 300,
                borderRadius: 8,
                // marginRight: 15,
                textAlign: "center",
                marginVertical: 5,
                fontWeight: "bold",
              }}
            >
              Form Request
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}