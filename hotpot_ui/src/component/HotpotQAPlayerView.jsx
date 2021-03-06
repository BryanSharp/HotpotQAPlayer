import React from 'react'

import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.css'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import ReactLoading from 'react-loading';
import _ from 'lodash';
import ShowMoreText from 'react-show-more-text';
import { AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ReferenceLine } from 'recharts';
/**
 * Palette
 * https://material-ui.com/customization/palette/
 */
const StyledTableCell = withStyles((theme) => ({
    head: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
    },
    body: {
        fontSize: 14,
    },
}))(TableCell);
const RADIAN = Math.PI / 180;
const StyledTableRow = withStyles((theme) => ({
    root: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
    },
}))(TableRow);
const PieCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, name, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.35;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="black" fontSize={10} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${name}-${(percent * 100).toFixed(1)}%`}
        </text>
    );
};
const COLORS = ['#0f52ba', '#00C49F', '#FFBB28', '#CDEC4D', '#7fffd4']
export default class HotpotQAPlayerView extends React.Component {
    state = {
        idList: null,
        result: null,
        selectedIndex: 0,
        case: null
    }

    render() {
        const caseData = this.state.case
        const nerObjData = this.state.nerObj
        if (!caseData) {
            return <center><ReactLoading color="#0f52ba" type="bubbles" height={100} width={100} /></center>
        }
        const idTypeList = this.state.idTypeList
        const idList = this.state.idList

        const supportingFacts = caseData.supporting_facts
        console.log(supportingFacts)
        const sTitles = {}
        supportingFacts.forEach(fact => {
            sTitles[fact[0]] = fact[1]
        })

        const supportingFactsPrediction = caseData.supporting_facts_in_prediction
        console.log(caseData)
        const sTitlesPrediction = {}
        supportingFactsPrediction.forEach(fact => {
            sTitlesPrediction[fact[0]] = fact[1]
        })
        const overallPieSize = 240

        const sumType = _.countBy(idTypeList, 'tag')
        const chartDataType = _.keys(sumType).map((k) => { return { 'name': k, 'value': sumType[k] } })

        const sumNumberDist = _.countBy(idList, function (e) {
            if (e.numberInvolved) {
                return 'NumberAppeared'
            }
            return "NoNumber"
        })
        const chartNumberDataDist = _.keys(sumNumberDist).map((k) => { return { 'name': k, 'value': sumNumberDist[k] } })

        const sumDist = _.countBy(idList, function (e) {
            const j = e.jaroWinklerDistance
            if (j >= 1) {
                return 'identical'
            }
            if (e.predictionIncluded) {
                return 'partial'
            }
            if (j >= 0.3) {
                return 'similar'
            }
            if (j >= 0.1) {
                return 'mismatch'
            }
            return 'wrong'
        })
        const chartDataDist = _.keys(sumDist).map((k) => { return { 'name': k, 'value': sumDist[k] } })

        return <table className='table table-borderless'>
            <tbody>
                <tr>
                    <td colSpan='3'>
                        <table className='table table-borderless'>
                            <tbody>
                                <tr>
                                    <td>
                                        <PieChart width={overallPieSize} height={overallPieSize}>
                                            <Pie
                                                data={chartDataType}
                                                labelLine={false}
                                                label={PieCustomizedLabel}
                                                dataKey='value'>
                                                {chartDataType.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </td>
                                    <td>
                                        <PieChart width={overallPieSize} height={overallPieSize}>
                                            <Pie
                                                data={chartNumberDataDist}
                                                labelLine={false}
                                                label={PieCustomizedLabel}
                                                dataKey='value'>
                                                {chartNumberDataDist.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </td>
                                    <td>
                                        <PieChart width={overallPieSize} height={overallPieSize}>
                                            <Pie
                                                data={chartDataDist}
                                                labelLine={false}
                                                label={PieCustomizedLabel}
                                                dataKey='value'>
                                                {chartDataDist.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td>
                        <TableContainer component={Paper} style={{ width: "306px", height: '780px' }}>
                            <Table aria-label="simple table" size="small">
                                <TableHead>
                                    <TableRow key="title-1">
                                        <StyledTableCell><b>Case ID List</b></StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {idList.map((idRefObj, index) =>
                                        <StyledTableRow key={idRefObj.id} style={this.chooseStyle(idRefObj)} onClick={(e) => { this.clickId(e, idRefObj.id, index) }}>
                                            <TableCell>{index == this.state.selectedIndex ? <b>{"> "}</b> : null}{index + 1}. {idRefObj.id}{index == this.state.selectedIndex ? <b>{" <"}</b> : null}</TableCell>
                                        </StyledTableRow>)}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </td>
                    <td>
                        <div style={{ width: '840px' }}>
                            <Paper className='p-2'>
                                <div style={{ fontSize: '1.5rem', fontFamily: '"Times New Roman", Lora, Serif' }}>
                                    <span className='badge badge-light'>Q&A</span>
                                </div>
                                <div className='p-2'>
                                    <div>
                                        <Typography variant="subtitle1" gutterBottom style={{ fontFamily: '"Times New Roman", Lora, Serif' }}>
                                            <b>{caseData.question}</b>
                                        </Typography>
                                        <Typography variant="body1" gutterBottom style={{ fontFamily: '"Times New Roman", Lora, Serif' }}>Correct answer:
                                    <span className='badge badge-info ml-2' style={{ fontFamily: '"Times New Roman", Lora, Serif' }}>
                                                {caseData.answer}
                                            </span>
                                        </Typography>
                                        <Typography variant="body1" gutterBottom style={{ fontFamily: '"Times New Roman", Lora, Serif' }}>Prediction answer:
                                    <span className='badge badge-success ml-2' style={{ fontFamily: '"Times New Roman", Lora, Serif' }}>
                                                {caseData.answer_prediction}
                                            </span>
                                        </Typography>
                                    </div>
                                    <div>
                                        <span className='badge badge-info mb-2' style={{ fontFamily: '"Times New Roman", Lora, Serif', fontSize: '0.8rem' }}>
                                            {caseData.type.toUpperCase()}
                                        </span>
                                        <span className='badge badge-warning ml-2 mb-2' style={{ fontFamily: '"Times New Roman", Lora, Serif', fontSize: '0.8rem' }}>
                                            {caseData.level.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </Paper>
                            <Paper className='p-2 mt-4'>
                                <div style={{ fontSize: '1.5rem', fontFamily: '"Times New Roman", Lora, Serif' }}>
                                    <span className='badge badge-light'>Context</span>
                                </div>
                                <div className='p-2 mt-1'>
                                    <Typography variant="subtitle1" gutterBottom style={{ fontFamily: '"Times New Roman", Lora, Serif' }}>
                                        <span>Supporting facts highlight color: </span>
                                        <span style={{ backgroundColor: '#20D18B' }}>OVERLAP</span>
                                        <span className='ml-1' style={{ backgroundColor: '#2dd' }}>GIVEN</span>
                                        <span className='ml-1' style={{ backgroundColor: '#CDEC4D' }}>PREDICTION</span>
                                        <hr />
                                    </Typography>
                                    {caseData.context.map(ct => {
                                        const title = ct[0]
                                        const contentArr = ct[1]

                                        var spIndex = -1
                                        if (_.keys(sTitles).includes(title)) {
                                            spIndex = sTitles[title]
                                        }

                                        var spIndexPrediction = -1
                                        if (_.keys(sTitlesPrediction).includes(title)) {
                                            spIndexPrediction = sTitlesPrediction[title]
                                        }

                                        const content = <Typography variant="body1" gutterBottom style={{ fontFamily: '"Times New Roman", Lora, Serif' }}>
                                            {contentArr.map((sentence, index) => {
                                                if (index == spIndex && index == spIndexPrediction) {
                                                    return <span key={title + index} style={{ backgroundColor: '#20D18B' }}>{sentence}</span>
                                                }
                                                return <span key={title + index} style={index == spIndex ? { backgroundColor: '#2dd' } : index == spIndexPrediction ? { backgroundColor: '#CDEC4D' } : null}>{sentence}</span>
                                            })}
                                        </Typography>

                                        return <div key={title}>
                                            <Typography variant="h6" gutterBottom style={{ fontFamily: '"Times New Roman", Lora, Serif' }}>
                                                {title}
                                            </Typography>
                                            {spIndex == -1 && spIndexPrediction == -1 ?
                                                <ShowMoreText
                                                    lines={1}
                                                    style={{ fontFamily: '"Times New Roman", Lora, Serif' }}
                                                    more='Show more'
                                                    less='Show less'
                                                    expanded={false}>
                                                    {content}
                                                </ShowMoreText>
                                                : content}
                                        </div>
                                    }
                                    )}
                                </div>
                            </Paper>
                            <Paper className='p-3 mt-4'>
                                <Typography variant="h5" gutterBottom style={{ fontFamily: '"Times New Roman", Lora, Serif' }}>
                                    <b>Debug Info</b>
                                </Typography>
                                <Typography variant="subtitle1" gutterBottom style={{ fontFamily: '"Times New Roman", Lora, Serif' }}>
                                    <b>NER data</b>
                                </Typography>
                                <ShowMoreText
                                    lines={5}
                                    more='Show more'
                                    less='Show less'
                                    style={{ fontFamily: '"Times New Roman", Lora, Serif' }}
                                    expanded={false}>
                                    <pre>{JSON.stringify(nerObjData, null, 2)}</pre>
                                </ShowMoreText>
                                <Typography variant="subtitle1" gutterBottom style={{ fontFamily: '"Times New Roman", Lora, Serif' }}>
                                    <b>Source data</b>
                                </Typography>
                                <ShowMoreText
                                    lines={5}
                                    more='Show more'
                                    less='Show less'
                                    style={{ fontFamily: '"Times New Roman", Lora, Serif' }}
                                    expanded={false}>
                                    <pre>{JSON.stringify(caseData, null, 2)}</pre>
                                </ShowMoreText>

                            </Paper>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colSpan="2">{this.state.result}</td>
                </tr>
            </tbody>
        </table>
    }

    componentDidMount() {
        axios.get('/mrc/id/list').then(res => {
            if (res.data.code == 200) {
                this.setState({
                    idList: res.data.content
                })
                var firstId = res.data.content[0].id
                this.loadData(firstId, 0)
            }
        }).catch(this.errorHandler)

        axios.get('/mrc/id/level/list').then(res => {
            if (res.data.code == 200) {
                this.setState({
                    idLevelList: res.data.content
                })
            }
        }).catch(this.errorHandler)

        axios.get('/mrc/id/type/list').then(res => {
            if (res.data.code == 200) {
                this.setState({
                    idTypeList: res.data.content
                })
            }
        }).catch(this.errorHandler)
    }

    clickId = (e, id, index) => {
        this.loadData(id, index)
    }

    loadData = (id, index) => {
        axios.get('/mrc/obj/id/' + id).then(res => {
            if (res.data.code == 200) {
                const caseObj = res.data.content
                axios.get('/mrc/ner/obj/id/' + id).then(res => {
                    if (res.data.code == 200) {
                        this.setState({
                            selectedIndex: index,
                            nerObj: res.data.content,
                            case: caseObj
                        })
                    }
                }).catch(this.errorHandler)
            }
        }).catch(this.errorHandler)
    }

    chooseStyle = (idRefObj) => {
        if (idRefObj.jaroWinklerDistance > 0.8) return null
        if (idRefObj.jaroWinklerDistance > 0.6) return { backgroundColor: '#FAE0C3' }
        if (idRefObj.jaroWinklerDistance > 0.4) return { backgroundColor: '#FFB0A0' }
        if (idRefObj.jaroWinklerDistance > 0.2) return { backgroundColor: '#FF726A' }
        return { backgroundColor: '#FF3C35' }
    }

    handleExpandClick = () => {
        setExpanded(!expanded);
    };

    errorHandler = (error) => {
        console.log(error)
        if (error.response !== undefined) {
            this.setState({
                result: <center><h5><span className="badge badge-danger">{error.response.status}: {JSON.stringify(error.response.data)}</span></h5></center>,
                updateDisabled: false,
                addDisabled: false
            })
        }
    }
}