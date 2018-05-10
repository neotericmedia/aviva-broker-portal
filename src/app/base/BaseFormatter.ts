export class BaseFormatter {
  public static readonly numberFormatTypes = {
    currency: 'currency',
    percent: 'percent',
    decimal: 'decimal'
  };

  public static getCurrencyFormatter(locale: string): Intl.NumberFormat {
    return BaseFormatter.getFormatter(BaseFormatter.numberFormatTypes.currency, locale);
  }

  public static getPercentFormatter(locale: string): Intl.NumberFormat {
    return BaseFormatter.getFormatter(BaseFormatter.numberFormatTypes.percent, locale);
  }

  public static getDecimalFormatter(locale: string): Intl.NumberFormat {
    return BaseFormatter.getFormatter(BaseFormatter.numberFormatTypes.decimal, locale);
  }

  public static formatNumber(value: string, locale: string): string {
    let formatter = BaseFormatter.getDecimalFormatter(locale);
    if (value === '') {
      return;
    }
    const deformatted = BaseFormatter.deformatNumber(value);
    return formatter.format(+deformatted);
  }

  public static deformatNumber(formattedNumber: string): string {
    if (formattedNumber === '') {
      return;
    }
    let value = formattedNumber + '';
    value = value.replace(/\D/g, '');
    return value;
  }

  public static hasValue(value: any) {
    return value || value === 0;
  }

  protected static readonly currencyOptions = {
    style: BaseFormatter.numberFormatTypes.currency, currencyDisplay: 'symbol', currency: 'CAD', minimumFractionDigits: 0
  };
  protected static readonly percentOptions = {
    style: BaseFormatter.numberFormatTypes.percent, minimumFractionDigits: 0, maximumFractionDigits: 2
  };
  protected static readonly decimalOptions = {
    style: BaseFormatter.numberFormatTypes.decimal, minimumFractionDigits: 0, maximumFractionDigits: 2
  };
  protected static formats = {
    currency: {
      fr: new Intl.NumberFormat('fr-CA', BaseFormatter.currencyOptions),
      en: new Intl.NumberFormat('en-CA', BaseFormatter.currencyOptions)
    },
    percent: {
      fr: new Intl.NumberFormat('fr-CA', BaseFormatter.percentOptions),
      en: new Intl.NumberFormat('en-CA', BaseFormatter.percentOptions)
    },
    decimal: {
      fr: new Intl.NumberFormat('fr-CA', BaseFormatter.decimalOptions),
      en: new Intl.NumberFormat('en-CA', BaseFormatter.decimalOptions)
    }
  };

  private static getFormatter(type: string, locale: string): Intl.NumberFormat {
    let formatter;
    switch(locale) {
      case 'fr':
        formatter = BaseFormatter.formats[type][locale];
        break;
      default:
        formatter = BaseFormatter.formats[type].en;
        break;
    }
    return formatter;
  }
}
