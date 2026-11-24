import { Component } from 'react';

// ส่วน 3D พัง (เช่น เครื่องไม่รองรับ WebGL) → แสดง fallback แทน เนื้อหาส่วนอื่นยังใช้ได้
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
