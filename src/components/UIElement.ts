import BaseElement from './BaseElement';
import { PaymentAction } from '~/types';
import getImage from '../utils/get-image';

export interface UIElementProps {
    onChange?: (state: any, element: UIElement) => void;
    onValid?: (state: any, element: UIElement) => void;
    onSubmit?: (state: any, element: UIElement) => void;
    onComplete?: (state, element: UIElement) => void;
    onAdditionalDetails?: (state: any, element: UIElement) => void;
    onError?: (error, element?: UIElement) => void;

    createFromAction?: (action: PaymentAction, props: object) => UIElement;
    elementRef?: any;

    loadingContext?: string;

    name?: string;

    [key: string]: any;
}

export class UIElement extends BaseElement {
    protected componentRef: any;
    protected elementRef: any;
    public props: UIElementProps;

    constructor(props: UIElementProps) {
        super(props);
        this.submit = this.submit.bind(this);
        this.setState = this.setState.bind(this);
        this.onValid = this.onValid.bind(this);
        this.onComplete = this.onComplete.bind(this);
        this.handleAction = this.handleAction.bind(this);
        this.elementRef = (props && props.elementRef) || this;
    }

    setState(newState: object): void {
        this.state = { ...this.state, ...newState };
        this.onChange();
    }

    onChange(): object {
        const isValid = this.isValid;
        const state = { data: this.data, isValid };
        if (this.props.onChange) this.props.onChange(state, this);
        if (isValid) this.onValid();

        return state;
    }

    onValid() {
        const state = { data: this.data };
        if (this.props.onValid) this.props.onValid(state, this);
        return state;
    }

    startPayment(): Promise<any> {
        return Promise.resolve(true);
    }

    submit(): void {
        const { onError = () => {}, onSubmit = () => {} } = this.props;
        this.startPayment()
            .then(() => {
                const { data, isValid } = this;

                if (!isValid) {
                    this.showValidation();
                    return false;
                }

                return onSubmit({ data, isValid }, this);
            })
            .catch(error => onError(error));
    }

    onComplete(state): void {
        if (this.props.onComplete) this.props.onComplete(state, this);
    }

    showValidation(): this {
        if (this.componentRef && this.componentRef.showValidation) this.componentRef.showValidation();
        return this;
    }

    setStatus(status): this {
        if (this.componentRef && this.componentRef.setStatus) this.componentRef.setStatus(status);
        return this;
    }

    handleAction(action: PaymentAction) {
        if (!action || !action.type) throw new Error('Invalid Action');

        const paymentAction = this.props.createFromAction(action, {
            onAdditionalDetails: state => this.props.onAdditionalDetails(state, this.elementRef)
        });

        if (paymentAction) {
            this.unmount();
            paymentAction.mount(this._node);
            return paymentAction;
        }

        return null;
    }

    get isValid(): boolean {
        return false;
    }

    get icon() {
        return getImage({ loadingContext: this.props.loadingContext })(this.constructor['type']);
    }

    get displayName() {
        return this.props.name || this.constructor['type'];
    }
}

export default UIElement;
