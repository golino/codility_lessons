using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OddOccurrencesInArray
{
	class Program
	{
		static void Main(string[] args)
		{
			int[] v = new int[] { 1, 2, 2, 2, 3, 3, 3, 2, 99, 99, 99, 99, 3 };
			Console.WriteLine("Resultado: {0}", solution(v));
			Console.ReadLine();
		}
		public static int solution(int[] A)
		{
			int val = 0;
			Dictionary<int, int> keyValue = new Dictionary<int, int>();

			if (A.Length == 0 || A.Length > 1000000000)
				return 0;

			for (int i = 0; i < A.Length; i++)
			{
				if (keyValue.ContainsKey(A[i]))
					keyValue[A[i]]++;
				else
					keyValue.Add(A[i], 1);
			}

			foreach (KeyValuePair<int, int> item in keyValue)
			{
				if (item.Value % 2 != 0)
				{
					val = item.Key;
					break;
				}
			}
			
			return val;
		}
	}
}
