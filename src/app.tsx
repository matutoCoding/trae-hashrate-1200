import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { useAppStore } from './store';
// 全局样式
import './app.scss';

function App(props) {
  const initData = useAppStore(state => state.initData);

  useEffect(() => {
    initData();
  }, [initData]);

  // 对应 onShow
  useDidShow(() => {});

  // 对应 onHide
  useDidHide(() => {});

  return props.children;
}

export default App;
