import {
	Text,
	StyleSheet,TouchableOpacity
} from 'react-native';

const Button = ({title, onPress, style, textStyle}) => {
	return (
		<TouchableOpacity
			style={[styles.createButton, style]}
			onPress={onPress}
		>
			<Text style={[styles.createButtonText, textStyle]}>{title}</Text>
		</TouchableOpacity>
		
	);
};
export default Button;

const styles = StyleSheet.create({
	createButton: {
		backgroundColor: '#5DBEA3',
		paddingVertical: 16,
		alignItems: 'center',
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		marginHorizontal:12,
		marginBottom:6,
		borderRadius: 50,
	},
	button: {
		backgroundColor: '#007bff',
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 12,
	},
	createButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
})
