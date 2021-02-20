import { isLocalHost } from './url';

export const saveStyle = async (newStyle, selectedStyle) => {
  if (isLocalHost) {
    const responseRaw = await fetch('http://localhost:9000/modify_colors', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        styleName: selectedStyle,
        colors: newStyle,
      }),
    });
    const response = await responseRaw.json();
    console.info(response);
  }
};
