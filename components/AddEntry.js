import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Modal,
  StyleSheet,
  Button
} from 'react-native';
import { connect } from 'react-redux';

import {
  getMetricMetaInfo,
  getDailyReminderValue,
  timeToString
} from '../utils/helpers';
import UdaciSlider from './UdaciSlider';
import UdaciStepper from './UdaciSteppers';
import DateHeader from './DateHeader';
import TextButton from './TextButton';
import { addEntry } from '../actions';

import { submitEntry, removeEntry } from '../utils/api';

import Ionicons from '@expo/vector-icons/Ionicons';

const SubmitBtn = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>SUBMIT</Text>
    </TouchableOpacity>
  );
};
class AddEntry extends Component {
  state = {
    run: 0,
    bike: 0,
    swim: 0,
    sleep: 0,
    eat: 0,
    modalVisible: false
  };
  openModal() {
    this.setState({ modalVisible: true });
  }

  closeModal() {
    this.setState({ modalVisible: false });
  }
  increment = metric => {
    const { max, step } = getMetricMetaInfo(metric);
    this.setState(state => {
      const count = state[metric] + step;

      return {
        ...state,
        [metric]: count > max ? max : count
      };
    });
  };
  decrement = metric => {
    this.setState(state => {
      const count = state[metric] - getMetricMetaInfo(metric).step;

      return {
        ...state,
        [metric]: count < 0 ? 0 : count
      };
    });
  };
  slide = (metric, value) => {
    this.setState(() => ({
      [metric]: value
    }));
  };
  submit = () => {
    const key = timeToString();
    const entry = this.state;
    const { addEntry } = this.props;

    addEntry({
      [key]: entry
    });
    // this.props.dispatch(
    //   addEntry({
    //     [key]: entry
    //   })
    // );

    this.setState({
      run: 0,
      bike: 0,
      swim: 0,
      sleep: 0,
      eat: 0
    });
    //Navigate to home

    submitEntry({ key, entry });

    //Clear local notifications
  };
  reset = () => {
    const key = timeToString();
    const { addEntry } = this.props;

    addEntry({
      [key]: getDailyReminderValue()
    });

    //Route to Home

    removeEntry(key);
  };
  render() {
    const metaInfo = getMetricMetaInfo();
    if (this.props.alreadyLogged) {
      return (
        <View>
          <Ionicons name="ios-happy-outline" size={100} />
          <Text>You already logged your information for today</Text>

          <TextButton onPress={this.reset}>Reset</TextButton>
        </View>
      );
    }
    return (
      <View>
        <DateHeader date={new Date().toLocaleDateString()} />
        {Object.keys(metaInfo).map(key => {
          const { getIcon, type, ...rest } = metaInfo[key];
          const value = this.state[key];

          return (
            <View key={key}>
              {getIcon()}
              {type === 'slider' ? (
                <UdaciSlider
                  value={value}
                  onChange={value => this.slide(key, value)}
                  {...rest}
                />
              ) : (
                <UdaciStepper
                  value={value}
                  onIncrement={() => this.increment(key)}
                  onDecrement={() => this.decrement(key)}
                  {...rest}
                />
              )}
            </View>
          );
        })}
        <SubmitBtn onPress={this.submit} />
        {/* <Button onPress={() => this.openModal()} title="Open modal" /> */}

        <View style={styles.container}>
          <Modal
            visible={this.state.modalVisible}
            animationType={'slide'}
            onRequestClose={() => this.closeModal()}
          >
            <View style={styles.modalContainer}>
              <View style={styles.innerContainer}>
                <Text>This is content inside of modal component</Text>
                <Button onPress={() => this.closeModal()} title="Close modal" />
              </View>
            </View>
          </Modal>
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => {
  const key = timeToString();
  console.log('time to string key', key);
  console.log('state', state);
  console.log(state[key] && state[key].today === undefined);

  return {
    alreadyLogged: state[key] && state[key].today === undefined
  };
};
export default connect(mapStateToProps, { addEntry })(AddEntry);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'grey'
  },
  innerContainer: {
    alignItems: 'center'
  }
});
