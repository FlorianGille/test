/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Fragment } from 'react';
import { BleManager } from 'react-native-ble-plx';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

export const REGISTRY_CHAR_BEGINNING = '00000003';
export const REGISTRY_SERVICE_BEGINNING = '00000002';
export const REGISTRY_CHARACTERISTICS_END = '8000-de7a7ec00000';
export const REGISTRY_GATEWAY_FOCUSED_SLAVE = '00000031-0000-0000';
export const REGISTRY_GATEWAY_PASSKEY = '00000041-0000-0000';
export const REGISTRY_GATEWAY_SERVICE_UUID = '00000001-0000-0000';
export const REGISTRY_BATH_POWER_STATE = '0-0001';
export const REGISTRY_BATH_LIGHT_STATE = '0-0002';
export const REGISTRY_BATH_OPTION_1_STATE = '0-0003';
export const REGISTRY_BATH_OPTION_2_STATE = '0-0004';
export const REGISTRY_BATH_OPTION_3_STATE = '0-0005';
export const REGISTRY_BATH_OPTION_4_STATE = '0-0006';
export const REGISTRY_BATH_STATE = '3-0013';
export const REGISTRY_CURRENT_TEMP = '3-0009';
export const REGISTRY_TEMP_TO_REACH = '4-0007';
export const REGISTRY_PERFUME_PERCENTAGE = '4-0008';
export const REGISTRY_DEVICE_NAME_START = '00000042';
export const REGISTRY_REGISTER_VERSION_START = '00000032';
export const REGISTRY_UNIT_TYPE_START = '00000022';

export const GATEWAT_UUID = `${REGISTRY_GATEWAY_SERVICE_UUID}${REGISTRY_CHARACTERISTICS_END}`;

export const SLAVES_CHAR_NAMES = {
  CHARACTERISTIC_BATH_STATE: 'CHARACTERISTIC_BATH_STATE',
  CHARACTERISTIC_CURRENT_TEMP: 'CHARACTERISTIC_CURRENT_TEMP',
  CHARACTERISTIC_TEMP_TO_REACH: 'CHARACTERISTIC_TEMP_TO_REACH',
  CHARACTERISTIC_PERFUME: 'CHARACTERISTIC_PERFUME',
  CHARACTERISTIC_BATH_NAME: 'CHARACTERISTIC_BATH_NAME',
  CHARACTERISTIC_POWER_STATE: 'CHARACTERISTIC_POWER_STATE',
  CHARACTERISTIC_LIGHT_STATE: 'CHARACTERISTIC_LIGHT_STATE',
  CHARACTERISTIC_OPTION_1_STATE: 'CHARACTERISTIC_OPTION_1_STATE',
  CHARACTERISTIC_OPTION_2_STATE: 'CHARACTERISTIC_OPTION_2_STATE',
  CHARACTERISTIC_OPTION_3_STATE: 'CHARACTERISTIC_OPTION_3_STATE',
  CHARACTERISTIC_OPTION_4_STATE: 'CHARACTERISTIC_OPTION_4_STATE',
};

export const SLAVES_CHARACTERISTICS_UUIDS = {
  [SLAVES_CHAR_NAMES.CHARACTERISTIC_BATH_STATE]: `${REGISTRY_CHAR_BEGINNING}-SLAVE_ID${REGISTRY_BATH_STATE}-${REGISTRY_CHARACTERISTICS_END}`,
  [SLAVES_CHAR_NAMES.CHARACTERISTIC_CURRENT_TEMP]: `${REGISTRY_CHAR_BEGINNING}-SLAVE_ID${REGISTRY_CURRENT_TEMP}-${REGISTRY_CHARACTERISTICS_END}`,
  [SLAVES_CHAR_NAMES.CHARACTERISTIC_TEMP_TO_REACH]: `${REGISTRY_CHAR_BEGINNING}-SLAVE_ID${REGISTRY_TEMP_TO_REACH}-${REGISTRY_CHARACTERISTICS_END}`,
  [SLAVES_CHAR_NAMES.CHARACTERISTIC_PERFUME]: `${REGISTRY_CHAR_BEGINNING}-SLAVE_ID${REGISTRY_PERFUME_PERCENTAGE}-${REGISTRY_CHARACTERISTICS_END}`,
  [SLAVES_CHAR_NAMES.CHARACTERISTIC_BATH_NAME]: `${REGISTRY_CHAR_BEGINNING}-SLAVE_ID${REGISTRY_PERFUME_PERCENTAGE}-${REGISTRY_CHARACTERISTICS_END}`,
  [SLAVES_CHAR_NAMES.CHARACTERISTIC_POWER_STATE]: `${REGISTRY_CHAR_BEGINNING}-SLAVE_ID${REGISTRY_BATH_POWER_STATE}-${REGISTRY_CHARACTERISTICS_END}`,
  [SLAVES_CHAR_NAMES.CHARACTERISTIC_LIGHT_STATE]: `${REGISTRY_CHAR_BEGINNING}-SLAVE_ID${REGISTRY_BATH_LIGHT_STATE}-${REGISTRY_CHARACTERISTICS_END}`,
  [SLAVES_CHAR_NAMES.CHARACTERISTIC_OPTION_1_STATE]: `${REGISTRY_CHAR_BEGINNING}-SLAVE_ID${REGISTRY_BATH_OPTION_1_STATE}-${REGISTRY_CHARACTERISTICS_END}`,
  [SLAVES_CHAR_NAMES.CHARACTERISTIC_OPTION_2_STATE]: `${REGISTRY_CHAR_BEGINNING}-SLAVE_ID${REGISTRY_BATH_OPTION_2_STATE}-${REGISTRY_CHARACTERISTICS_END}`,
  [SLAVES_CHAR_NAMES.CHARACTERISTIC_OPTION_3_STATE]: `${REGISTRY_CHAR_BEGINNING}-SLAVE_ID${REGISTRY_BATH_OPTION_3_STATE}-${REGISTRY_CHARACTERISTICS_END}`,
  [SLAVES_CHAR_NAMES.CHARACTERISTIC_OPTION_4_STATE]: `${REGISTRY_CHAR_BEGINNING}-SLAVE_ID${REGISTRY_BATH_OPTION_4_STATE}-${REGISTRY_CHARACTERISTICS_END}`,
};


export default class App extends React.Component {

  constructor() {
    super();
    this.manager = new BleManager();
  }

  async componentDidMount() {
    this.manager.startDeviceScan(null, null, async (error, device) => {
      if (error) {
        console.log(error);
        return;
      }
      const knownDevice = [];
      if (device.name && (device.name.indexOf('DGW') > -1 || device.name.indexOf('DWG') > -1)){
        if (knownDevice.indexOf(device) === -1) {
          knownDevice.push(device);

          console.log('Found a device !', device);
          this.manager.stopDeviceScan();
          try {
            await this.manager.connectToDevice(device.id, {
              autoConnect: false,
              refreshGatt: 'OnConnected',
            });
            console.log('connected to : ', device);
          } catch (err) {
            console.log('ERROR CONNECT', err);
          }
          try {
            if (this.manager.isDeviceConnected(device.id)) {
              await device.discoverAllServicesAndCharacteristics()
              .then((deviceWithServices) => {
                this.manager.servicesForDevice(deviceWithServices.id).then(async (serviceList) => {

                  // this.printAllCharcteristicsValueForService(serviceList[3]);

                  console.log('Service list', serviceList);

                  // List descriptor
                  const slavesServicesAndSubservices = serviceList.filter(service => service.uuid.substr(7, 1) === '2');
                  const slavesService = slavesServicesAndSubservices.filter(service => service.uuid.substr(0, 8) === '00000002');
                  const subServices = slavesServicesAndSubservices
                    .filter(service => !slavesService.some(mainSlave => mainSlave.uuid === service.uuid));

                  console.log('SubService', subServices);

                  // ---------------
                  const bathesInfos = slavesService.map((service) => {
                    const slaveId = service.uuid.substr(9, 3);
                    const charPromises = slavesServicesAndSubservices
                      .filter(serviceOrSubservice => serviceOrSubservice.uuid.substr(9, 3) === slaveId)
                      .map(subservices => subservices.characteristics());

                    const bathNamePromise = this.manager.readCharacteristicForDevice(
                      deviceWithServices.id,
                      `${REGISTRY_SERVICE_BEGINNING}-${slaveId}0-0000-${REGISTRY_CHARACTERISTICS_END}`,
                      `${REGISTRY_DEVICE_NAME_START}-${slaveId}0-0000-${REGISTRY_CHARACTERISTICS_END}`,
                    );

                    const registerVersionPromise = this.manager.readCharacteristicForDevice(
                      deviceWithServices.id,
                      `${REGISTRY_SERVICE_BEGINNING}-${slaveId}0-0000-${REGISTRY_CHARACTERISTICS_END}`,
                      `${REGISTRY_REGISTER_VERSION_START}-${slaveId}0-0000-${REGISTRY_CHARACTERISTICS_END}`,
                    );

                    // Si différent de 1 alors pas bain vapeur
                    const unitTypePromise = this.manager.readCharacteristicForDevice(
                      deviceWithServices.id,
                      `${REGISTRY_SERVICE_BEGINNING}-${slaveId}0-0000-${REGISTRY_CHARACTERISTICS_END}`,
                      `${REGISTRY_UNIT_TYPE_START}-${slaveId}0-0000-${REGISTRY_CHARACTERISTICS_END}`,
                    );

                    return {
                      id: slaveId,
                      name: bathNamePromise,
                      mainServiceUUID: service.uuid,
                      charPromises,
                      deviceId: deviceWithServices.id,
                      secured: true,
                      registerVersion: registerVersionPromise,
                      unitType: unitTypePromise,
                    };
                  });
                  console.log('infos of bathes: ', bathesInfos);

                  if (bathesInfos.length > 0) {
                    const bath = bathesInfos[0];
                    try {
                      let bathChars = await this.getSlaveCharacteristicsMapping(bath);
                      console.log('bath', bathChars);

                      const bathStateCharInfos = bathChars.characteristics[SLAVES_CHAR_NAMES.CHARACTERISTIC_BATH_STATE];

                      if (!bathStateCharInfos) {
                        console.error('The characteristic of bath state (powered, standingBy, 3 or 8 cts is missing), it shouldnt happen');
                      }

                      const bathStateChar = this.manager.readCharacteristicForDevice(
                        bath.deviceId,
                        bathStateCharInfos.serviceId, bathStateCharInfos.characteristicId,
                      );

                      console.log('FINISH', bathStateChar);
                    } catch (err) {
                      console.error('An error occurred while reading all bath info, with message:', err.message);
                      throw err;
                    }
                  }
                });
              });
            } else {
              console.log('DEVICE NOT CONNECTED');
            }
          } catch (err) {
            console.log('ERROR DISCOVER', err);
          }
        }
      }
    });
  }

  getSlaveCharacteristicsMapping = async (slaveInfos) => {
    let characteristics = await Promise.all(slaveInfos.charPromises);
    characteristics = characteristics.reduce((acc, cur) => [...acc, ...cur], []);
    return {
      ...slaveInfos,
      characteristics: this.getCharacteristicsMappingFromSlaveId(slaveInfos.id, characteristics),
      unmappedCharacteristics: characteristics,
    };
  };

  getCharacteristicsMappingFromSlaveId = (slaveId, characteristics) =>
  Object.keys(SLAVES_CHARACTERISTICS_UUIDS).reduce((acc, charConstKey) => {
    const char = characteristics.find(characToSearchOn => characToSearchOn.uuid === SLAVES_CHARACTERISTICS_UUIDS[charConstKey].replace('SLAVE_ID', slaveId));
    if (!char) {
      console.log(`Missing characteristic ${SLAVES_CHARACTERISTICS_UUIDS[charConstKey]} for slaveId ${slaveId}`, characteristics, characteristics.map(c => c.uuid));
      // throw new Error(`Missing characteristic ${SLAVES_CHARACTERISTICS_UUIDS[charConstKey]} for slaveId ${slaveId}`);
    } else {
      acc[charConstKey] = {
        serviceId: char.serviceUUID,
        characteristicId: char.uuid,
      };
    }
    return acc;
  }, {});

  render() {
    return (
      <Fragment>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}
          >
            <Header />
            {global.HermesInternal == null ? null : (
              <View style={styles.engine}>
                <Text style={styles.footer}>Engine: Hermes</Text>
              </View>
            )}
            <View style={styles.body}>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Step One</Text>
                <Text style={styles.sectionDescription}>
                  Edit <Text style={styles.highlight}>App.js</Text> to change this
                  screen and then come back to see your edits.
                </Text>
              </View>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>See Your Changes</Text>
                <Text style={styles.sectionDescription}>
                  <ReloadInstructions />
                </Text>
              </View>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Debug</Text>
                <Text style={styles.sectionDescription}>
                  <DebugInstructions />
                </Text>
              </View>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Learn More</Text>
                <Text style={styles.sectionDescription}>
                  Read the docs to discover what to do next:
                </Text>
              </View>
              <LearnMoreLinks />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});
