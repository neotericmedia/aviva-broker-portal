import { Skip } from 'serializer.ts/Decorators';

export class LobCoverage {
    @Skip()
    public id: number;

    @Skip()
    public isSelected: boolean = false;

    @Skip()
    public zoneValue: string;

    @Skip()
    public CovLimit: number;

    // new fields after form fields selection
    public Limit: string;
    public Deductible1: string;
    public Deductible2: string;

    // original fields
    public FormNumber: string;
    public FormLanguage: string;
    public FormVersion: string;
    public CoverageSequence: string;
    public Existence: string;
    public CoverageGroup: string;
    public CoverageRelationship: string;
    public LimitRequired: string;
    public LimitType: string;
    public DefaultLimit: string;
    public MinimumLimit: string;
    public MaximumLimit: string;
    public LimitEnum: EnumType;
    public Deductible1Required: string;
    public Deductible1Type: string;
    public Deductible1Default: string;
    public Deductible1Enum: EnumType;
    public Deductible2Required: string;
    public Deductible2Type: string;
    public Deductible2Default: string;
    public Deductible2Enum: EnumType;
    public RateableType: string;
    public PremiumDisplay: string;
    public IsRateDisplay: string;
    public CoinsDefault: string;
    public RatingDataSetName: string;
    public CoverageRateCode: string;
    public GroupCovRateCode: string;
    public ModifierType: string;
    public OutputFormNumber: string;
    public CoverageOptionality: string;
    public IsScheduled: string;
    public IsAdjustable: string;
    public MapLimitType: string;
    public IsClaimsMade: string;
    public NamedPerilBroadForm: string;
    public AllPropertyBusConts: string;
    public RTMFormType: string;
    public FormType: string;
    public DisplayPriority: string;
    public IsDisplayListBox: string;
    public CoverageLevel: string;
    public PossibleParentForms: string[] | undefined;
    public Locale: Locale;
    public Premium: number;
    public Rate: number;
}

class Locale {
    public Title: string;
}

class EnumType {
    public EnumName: string;
    public EnumFormat: string;
    public EnumValueList: string[];
}
