import { Text } from "react-native";

const BodyText = ({ style, ...props }) => {
  return (
    <Text
      style={[{ fontFamily: "Poppins-Thin" }, style]}
      {...props}
    />
  );
};

export default BodyText;
