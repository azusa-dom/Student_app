import json
import sys

def jsonl_to_json(input_file, output_file):
    """将JSONL文件转换为JSON数组格式"""
    data = []
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    data.append(json.loads(line))
        print(f"成功读取 {len(data)} 条记录")
    except FileNotFoundError:
        print(f"错误：找不到文件 {input_file}")
        return
    except json.JSONDecodeError as e:
        print(f"JSON解析错误: {e}")
        return

    # 写入JSON文件
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"成功转换并保存到 {output_file}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("用法: python jsonl_to_json.py <input.jsonl> <output.json>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    jsonl_to_json(input_file, output_file)