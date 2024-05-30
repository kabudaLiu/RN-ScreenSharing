/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useRef} from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
  findNodeHandle,
  Platform,
  PermissionsAndroid,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import ZegoExpressEngine, {
  ZegoRoomConfig,
  ZegoTextureView,
  ZegoVideoSourceType,
  ZegoPublishChannel,
} from 'zego-express-engine-reactnative';
const granted =
  Platform.OS == 'android'
    ? PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.RECORD_AUDIO,
      )
    : undefined;
const appID = 89584431;
// const userID = 'kabuda';
const appSign =
  '5954718606e1f0e3f48a51e9d451d70a9118069735ea91a456e246c68a72fd67';

function App(): JSX.Element {
  const zego_preview_view = useRef(null);
  const zego_play_view = useRef(null);

  useEffect(() => {
    console.log('componentDidMount');
    let profile = {
      appID: appID,
      appSign: appSign,
      scenario: 0,
    };

    ZegoExpressEngine.createEngineWithProfile(profile).then(engine => {
      // 动态获取设备权限（android）
      if (Platform.OS == 'android') {
        granted
          .then(data => {
            console.log('是否已有相机、麦克风权限: ' + data);
            if (!data) {
              const permissions = [
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                PermissionsAndroid.PERMISSIONS.CAMERA,
              ];
              //返回得是对象类型
              PermissionsAndroid.requestMultiple(permissions);
            }
          })
          .catch(err => {
            console.log('check err: ' + err.toString());
          });
      }

      engine.getVersion().then(ver => {
        console.log('Express SDK Version: ' + ver);
      });
    });

    return () => {
      if (ZegoExpressEngine.instance()) {
        console.log('[LZP] destroyEngine');
        ZegoExpressEngine.destroyEngine();
      }
    };
  });
  const onClickA = () => {
    let roomConfig = new ZegoRoomConfig();

    roomConfig.isUserStatusNotify = true;
    // 取一个react 的 ref
    let localViewRef = findNodeHandle(zego_preview_view?.current);
    // 取一个react 的 ref
    let remoteViewRef = findNodeHandle(zego_play_view?.current);
    ZegoExpressEngine.instance().on(
      'roomStateUpdate',
      (roomID, state, errorCode, extendedData) => {
        // 房间状态更新回调，登录房间后，当房间连接状态发生变更（如出现房间断开，登录认证失败等情况），SDK会通过该回调通知
        console.log(
          'JS onRoomStateUpdate: ' +
            state +
            ' roomID: ' +
            roomID +
            ' err: ' +
            errorCode +
            ' extendData: ' +
            extendedData,
        );
      },
    );

    ZegoExpressEngine.instance().on(
      'roomUserUpdate',
      (roomID, updateType, userList) => {
        // 用户状态更新，登录房间后，当房间内有用户新增或删除时，SDK会通过该回调通知
        console.log(
          'updateType ' +
            updateType +
            ' roomID: ' +
            roomID +
            ' userList111: ' +
            userList,
        );
      },
    );

    ZegoExpressEngine.instance().on(
      'roomStreamUpdate',
      (roomID, updateType, streamList) => {
        // 流状态更新，登录房间后，当房间内有用户新推送或删除音视频流时，SDK会通过该回调通知
        console.log(
          'updateType ' +
            updateType +
            ' roomID: ' +
            roomID +
            ' streamList111: ' +
            streamList,
        );
      },
    );
    ZegoExpressEngine.instance().on(
      'publisherStateUpdate',
      (streamID, state, errorCode, extendedData) => {
        // 调用推流接口成功后，当推流器状态发生变更，如出现网络中断导致推流异常等情况，SDK在重试推流的同时，会通过该回调通知
        //....
        console.log(
          'JS onPublisherStateUpdate: ' +
            state +
            ' streamID: ' +
            streamID +
            ' err: ' +
            errorCode +
            ' extendData: ' +
            extendedData,
        );
      },
    );
    ZegoExpressEngine.instance().on(
      'playerStateUpdate',
      (streamID, state, errorCode, extendedData) => {
        /** 调用拉流接口成功后，当拉流器状态发生变更，如出现网络中断导致推流异常等情况，SDK在重试拉流的同时，会通过该回调通知 */
        //....
        console.log(
          'JS onPlayerStateUpdate: ' +
            state +
            ' streamID: ' +
            streamID +
            ' err: ' +
            errorCode +
            ' extendData: ' +
            extendedData,
        );
      },
    );

    // 登录房间
    // 开始登录房间
    ZegoExpressEngine.instance().loginRoom(
      'room1',
      {userID: 'id1', userName: 'user1'},
      roomConfig,
    );
    //普通推流
    // ZegoExpressEngine.instance().startPublishingStream('streamID');
    //共享推流
    ZegoExpressEngine.instance().startPublishingStream(
      'streamID',
      ZegoPublishChannel.Aux,
    );
    // ZegoExpressEngine.instance().startPreview({
    //   reactTag: localViewRef,
    //   viewMode: 0,
    //   backgroundColor: 0,
    // });
    //拉流
    // 开始拉流
    ZegoExpressEngine.instance().startPlayingStream('streamID', {
      reactTag: remoteViewRef,
      viewMode: 0,
      backgroundColor: 0,
    });
  };
  const onClickB = () => {
    /** 停止推流 */
    // ZegoExpressEngine.instance().stopPublishingStream();
    //停止共享屏幕推流
    ZegoExpressEngine.instance().stopPublishingStream(ZegoPublishChannel.Aux);
  };
  const onClickC = () => {
    // 停止本地预览
    ZegoExpressEngine.instance().stopPreview();
  };
  const onClickD = () => {
    // 停止拉流
    ZegoExpressEngine.instance().stopPlayingStream('streamID');
  };
  const onClickE = () => {
    // 退出房间
    //停止其所有推拉流以及本地预览。
    ZegoExpressEngine.instance().logoutRoom('room1');
  };
  const onClickF = () => {
    //需要通过 setVideoSource 进行切换为屏幕共享。
    ZegoExpressEngine.instance().setVideoSource(
      ZegoVideoSourceType.ScreenCapture,
      ZegoPublishChannel.Aux,
    );
    //共享整个系统，可以调用 startScreenCapture 接口开启屏幕共享。
    ZegoExpressEngine.instance().startScreenCapture();
  };
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>本地预览</Text>
      <View style={{height: 150}}>
        <ZegoTextureView ref={zego_preview_view} style={{height: 150}} />
      </View>
      <Text style={styles.sectionTitle}>远端拉流</Text>
      <View style={{height: 150}}>
        <ZegoTextureView ref={zego_play_view} style={{height: 150}} />
      </View>
      {/* 小点窗口 */}
      {/* <View style={styles.dot} />
      <View style={styles.dot}>
        <ZegoTextureView ref={zego_preview_view} style={{height: 200}} />
      </View> */}
      {/* 按钮 */}
      <TouchableOpacity style={styles.button} onPress={() => onClickA()}>
        <Text style={styles.buttonText}>推拉流/本地预览</Text>
      </TouchableOpacity>
      {/* <View style={styles.dot}>
        <ZegoTextureView ref={zego_play_view} style={{height: 200}} />
      </View> */}
      <TouchableOpacity style={styles.button} onPress={() => onClickB()}>
        <Text style={styles.buttonText}>停止推流</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => onClickC()}>
        <Text style={styles.buttonText}>停止本地预览</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => onClickD()}>
        <Text style={styles.buttonText}>停止拉流</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => onClickE()}>
        <Text style={styles.buttonText}>退出房间</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => onClickF()}>
        <Text style={styles.buttonText}>开始共享</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // 铺满全屏
    // justifyContent: 'center', // 垂直居中
    // alignItems: 'center', // 水平居中
  },
  dot: {
    width: 100,
    height: 100,
    // borderRadius: 5,
    alignSelf: 'flex-end',

    // backgroundColor: 'red', // 小点的颜色
  },
  button: {
    marginTop: 20, // 按钮距离小点窗口的间距
    padding: 10,
    backgroundColor: 'blue', // 按钮的颜色
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  buttonText: {
    color: 'white', // 按钮文本颜色
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
