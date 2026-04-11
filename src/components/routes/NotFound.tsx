import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Button from "../helpers/Button";
import Flex from "../helpers/Flex";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function NotFound({...props}: Props) {

    const componentName = "NotFound";
    const { children, ...otherProps } = getCleanDefaultProps(props, componentName);

    return (
        <Flex verticalAlign="center" horizontalAlign="center" {...otherProps}>
            <div className="textCenter">
                <h2 className={`${componentName}-heading mt-5`}>404</h2>

                <h3 className={`${componentName}-textContent mt-3`}>We're sorry. The page you're looking for does not exist...</h3>

                <Button 
                    className={`${componentName}-backButton`}
                    onClick={() => window.history.back()}
                >
                    Go back
                </Button>

                {children}
            </div>
        </Flex>
    )
}
